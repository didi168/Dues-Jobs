require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { supabaseAdmin } = require('../src/services/supabase');

async function debugPreferences() {
  try {
    console.log('[Debug] Fetching user preferences...');
    
    const { data: prefs, error: prefError } = await supabaseAdmin
      .from('user_preferences')
      .select('*');

    if (prefError) throw prefError;

    console.log(`[Debug] Found ${prefs.length} user preferences:`);
    prefs.forEach(pref => {
      console.log(`\nUser: ${pref.user_id}`);
      console.log(`  Keywords: ${JSON.stringify(pref.keywords)}`);
      console.log(`  Locations: ${JSON.stringify(pref.locations)}`);
      console.log(`  Remote Only: ${pref.remote_only}`);
      console.log(`  Sources: ${JSON.stringify(pref.sources)}`);
      console.log(`  Email Enabled: ${pref.email_enabled}`);
      console.log(`  Telegram Enabled: ${pref.telegram_enabled}`);
    });

    console.log('\n[Debug] Fetching jobs...');
    const { data: jobs, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .limit(5);

    if (jobError) throw jobError;

    console.log(`[Debug] Found ${jobs.length} jobs (showing first 5):`);
    jobs.forEach(job => {
      console.log(`\nJob: ${job.title}`);
      console.log(`  Company: ${job.company}`);
      console.log(`  Source: ${job.source}`);
      console.log(`  Location: ${job.location}`);
      console.log(`  Is Remote: ${job.is_remote}`);
    });

    console.log('\n[Debug] Fetching user_jobs...');
    const { data: userJobs, error: ujError } = await supabaseAdmin
      .from('user_jobs')
      .select('*');

    if (ujError) throw ujError;

    console.log(`[Debug] Found ${userJobs.length} user_jobs entries`);
    userJobs.forEach(uj => {
      console.log(`  User: ${uj.user_id}, Job: ${uj.job_id}, Status: ${uj.status}`);
    });

  } catch (err) {
    console.error('[Debug] Error:', err);
  }
}

debugPreferences();
