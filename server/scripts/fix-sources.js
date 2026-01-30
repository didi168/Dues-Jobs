require('dotenv').config();
const { supabaseAdmin } = require('../src/services/supabase');

async function fix() {
  console.log('--- Updating User Sources ---');

  // Add new sources to ALL users for simplicity in this migration
  const { data: users, error } = await supabaseAdmin.from('user_preferences').select('user_id, sources');
  
  if (error) {
    console.error('Error:', error);
    return;
  }

  const newSources = ['Adzuna', 'Remotive', 'RemoteOK', 'LinkedIn', 'Indeed', 'Wellfound', 'Arc.dev'];

  for (const user of users) {
    // Merge existing with new defaults if they are missing
    const updatedSources = [...new Set([...(user.sources || []), ...newSources])];
    
    await supabaseAdmin
      .from('user_preferences')
      .update({ sources: updatedSources })
      .eq('user_id', user.user_id);
    
    console.log(`Updated user ${user.user_id} with sources:`, updatedSources);
  }

  // Also, we need to re-run the matching logic or reset matches?
  // Simply clearing user_jobs logic isn't enough, we need to run fetch again or match again.
  // But since fetch runs daily, user might wait.
  // I will trigger a match logic run manually for existing jobs if possible.
  // Actually, easiest is to tell user "Click Refresh". But Refresh triggers fetch.
  // If fetch finds duplicates, it might skip matching? 
  // Checking run-daily-fetch.js: 
  // It inserts new jobs -> then finds NEW jobs -> then matches.
  // OLD jobs won't be re-matched unless we force it.
  
  // Hack: We will trigger a match for all jobs against all users here.
  const JobMatcher = require('../src/services/JobMatcher');
  const { data: allJobs } = await supabaseAdmin.from('jobs').select('*');
  const { data: allPrefs } = await supabaseAdmin.from('user_preferences').select('*');

  console.log(`Re-matching ${allJobs.length} jobs for ${allPrefs.length} users...`);

  for (const pref of allPrefs) {
    const matches = JobMatcher.match(pref, allJobs);
    if (matches.length > 0) {
       const userJobRecords = matches.map(job => ({
          user_id: pref.user_id,
          job_id: job.id,
          status: 'new'
       }));
       await supabaseAdmin.from('user_jobs').upsert(userJobRecords, { onConflict: 'user_id,job_id', ignoreDuplicates: true });
       console.log(`Saved ${matches.length} matches for user ${pref.user_id}`);
    }
  }

  console.log('--- Fix Complete ---');
}

fix();
