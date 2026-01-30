require('dotenv').config();
const { supabaseAdmin } = require('../src/services/supabase');
const fetchers = require('../src/fetchers');
const JobNormalizer = require('../src/services/JobNormalizer');
const JobMatcher = require('../src/services/JobMatcher');
const emailService = require('../src/services/EmailService');
const telegramService = require('../src/services/TelegramService');

async function runDailyFetch() {
  const startTime = new Date();
  console.log(`[Cron] Starting daily fetch at ${startTime.toISOString()}`);

  try {
    // 1. Fetch from all sources
    let allRawJobs = [];
    for (const fetcher of fetchers) {
      try {
        const jobs = await fetcher.fetchJobs();
        allRawJobs = allRawJobs.concat(jobs);
      } catch (err) {
        console.error(`[Cron] Error fetching from ${fetcher.sourceName}:`, err);
      }
    }

    console.log(`[Cron] Fetched ${allRawJobs.length} raw jobs`);

    // 2. Normalize
    const normalizedJobs = allRawJobs.map(JobNormalizer.normalize);

    // 2.1 Enforce 72-hour window
    const cutoffDate = new Date(Date.now() - (72 * 60 * 60 * 1000));
    const recentJobs = normalizedJobs.filter(job => {
      const posted = new Date(job.posted_at);
      return posted >= cutoffDate;
    });

    console.log(`[Cron] Normalized ${normalizedJobs.length} jobs. Keeping ${recentJobs.length} recent (last 3 days).`);

    // 3. Deduplicate (In-memory for batch) & Insert
    // Note: Database handles dedup via canonical_hash UNIQUE constraint.
    // We just try to insert all avoiding duplicates.
    
    // 3. Insert and get all available recent jobs (including those already in DB)
    const { error: insertError } = await supabaseAdmin
      .from('jobs')
      .upsert(recentJobs, { 
        onConflict: 'canonical_hash', 
        ignoreDuplicates: true 
      });

    if (insertError) {
      throw new Error(`Insert failed: ${insertError.message}`);
    }

    // Fetch all jobs that exist in our 72h window from the DB.
    // This ensures we have the correct database IDs for all recent jobs.
    const hashes = recentJobs.map(j => j.canonical_hash);
    const { data: currentRecentJobs, error: fetchError } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .in('canonical_hash', hashes);

    if (fetchError) throw fetchError;

    console.log(`[Cron] Total applicable jobs for matching: ${currentRecentJobs.length}`);

    if (currentRecentJobs.length === 0) {
      console.log('[Cron] No jobs to process for users.');
      return; 
    }

    // 4. Fetch Users & Match
    const { data: userPrefs, error: userError } = await supabaseAdmin
      .from('user_preferences')
      .select('*'); 

    if (userError) throw userError;

    console.log(`[Cron] Processing matches for ${userPrefs.length} users...`);

    for (const pref of userPrefs) {
      // We now match against ALL recent jobs in the database
      const matchedJobs = JobMatcher.match(pref, currentRecentJobs);
      
      if (matchedJobs.length > 0) {
        // Map to user_jobs records
        const userJobRecords = matchedJobs.map(job => ({
          user_id: pref.user_id,
          job_id: job.id,
          status: 'new'
        }));

        // Upsert with ignoreDuplicates to find ONLY the ones we just added
        const { data: newlyAddedUserJobs, error: ujError } = await supabaseAdmin
          .from('user_jobs')
          .upsert(userJobRecords, { 
            onConflict: 'user_id,job_id', 
            ignoreDuplicates: true 
          })
          .select();

        if (ujError) {
          console.error(`[Cron] Error saving matches for user ${pref.user_id}`, ujError);
          continue;
        }

        // Only notify about jobs that were JUST added to this user's list in this run
        const trulyNewMatchesForUser = matchedJobs.filter(job => 
          newlyAddedUserJobs && newlyAddedUserJobs.some(uj => uj.job_id === job.id)
        );

        if (trulyNewMatchesForUser.length === 0) {
          continue; // No new alerts for this specific user in this run
        }

        console.log(`[Cron] Found ${trulyNewMatchesForUser.length} new matches for user ${pref.user_id}`);

        // Notifications
        let email = null;
        try {
            const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(pref.user_id);
            email = user?.email;
        } catch (e) {
            console.error(`[Cron] Could not fetch email for user ${pref.user_id}`);
        }

        if (pref.email_enabled && email) {
          await emailService.sendDailySummary(email, trulyNewMatchesForUser);
        }

        if (pref.telegram_enabled && pref.telegram_chat_id) {
          await telegramService.sendDailySummary(pref.telegram_chat_id, trulyNewMatchesForUser);
        }
      }
    }

    // Log Run
    await supabaseAdmin.from('fetch_logs').insert({
      status: 'success',
      jobs_fetched: allRawJobs.length,
      jobs_inserted: recentJobs.length,
      sources: fetchers.map(f => f.sourceName),
      completed_at: new Date().toISOString()
    });

    console.log('[Cron] Run completed successfully.');

  } catch (error) {
    console.error('[Cron] Run failed:', error);
    await supabaseAdmin.from('fetch_logs').insert({
      status: 'error',
      details: error.message,
      completed_at: new Date().toISOString()
    });
    process.exit(1);
  }
}

if (require.main === module) {
  runDailyFetch();
}

module.exports = runDailyFetch;
