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

    // 3. Deduplicate (In-memory for batch) & Insert
    // Note: Database handles dedup via canonical_hash UNIQUE constraint.
    // We just try to insert all avoiding duplicates.
    
    // Supabase upsert/insert. 
    // We want to skip duplicates. .upsert with ignoreDuplicates: true?
    // Or insert, and let it fail? 'onConflict' is better.
    
    const { data: insertedJobs, error: insertError } = await supabaseAdmin
      .from('jobs')
      .upsert(normalizedJobs, { 
        onConflict: 'canonical_hash', 
        ignoreDuplicates: true 
      })
      .select();

    if (insertError) {
      throw new Error(`Insert failed: ${insertError.message}`);
    }

    // "insertedJobs" might be null or empty if all were duplicates and we verified. 
    // Wait, upsert with ignoreDuplicates: true returns null for ignored rows?
    // We need to know which jobs are NEW to notify users.
    // Strategy: 
    // 1. Get all jobs created_at > startTime (minus safety buffer).
    // Or better: filter 'normalizedJobs' by checking if they exist? No too slow.
    // If we use 'insert' (not upsert) and ignore duplicates, we might get back generated IDs?
    // Actually, simple way: fetch all jobs created_after startTime.
    
    const { data: newJobs, error: fetchError } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .gt('created_at', startTime.toISOString());

    if (fetchError) throw fetchError;

    console.log(`[Cron] ${newJobs.length} new jobs inserted.`);

    if (newJobs.length === 0) {
      console.log('[Cron] No new jobs to process for users.');
      return; 
    }

    // 4. Fetch Users & Match
    const { data: userPrefs, error: userError } = await supabaseAdmin
      .from('user_preferences')
      .select('*'); 
      // Note: user_id is FK to auth.users. 
      // We assume public.user_preferences 'user_id' -> auth.users 'id'.
      // Supabase Join with auth schema is tricky. 
      // Usually can't join across schemas easily in client unless views exist.
      // We will perform match logic, then for notification we need email.
      // We can use supabaseAdmin.auth.admin.getUserById(id) potentially if N is small.
      // Or just assume we have email in preferences? No, prompt says "users (from Supabase Auth)".
      // Let's assume we can't join easily. We'll iterate.

    if (userError) throw userError;

    console.log(`[Cron] Processing matches for ${userPrefs.length} users...`);

    for (const pref of userPrefs) {
      const matchedJobs = JobMatcher.match(pref, newJobs);
      
      if (matchedJobs.length > 0) {
        // Create user_jobs
        const userJobRecords = matchedJobs.map(job => ({
          user_id: pref.user_id,
          job_id: job.id,
          status: 'new'
        }));

        const { error: ujError } = await supabaseAdmin
          .from('user_jobs')
          .upsert(userJobRecords, { onConflict: 'user_id,job_id', ignoreDuplicates: true });

        if (ujError) console.error(`[Cron] Error saving matches for user ${pref.user_id}`, ujError);

        // Notifications
        // We need the user's email.
        // Option A: Use `supabaseAdmin.auth.admin.getUserById`
        let email = null;
        try {
            const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(pref.user_id);
            email = user?.email;
        } catch (e) {
            console.error(`[Cron] Could not fetch email for user ${pref.user_id}`);
        }

        if (pref.email_enabled && email) {
          await emailService.sendDailySummary(email, matchedJobs);
        }

        if (pref.telegram_enabled && pref.telegram_chat_id) {
          await telegramService.sendDailySummary(pref.telegram_chat_id, matchedJobs);
        }
      }
    }

    // Log Run
    await supabaseAdmin.from('fetch_logs').insert({
      status: 'success',
      jobs_fetched: allRawJobs.length,
      jobs_inserted: newJobs.length,
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
