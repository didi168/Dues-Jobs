require('dotenv').config();
const { supabaseAdmin } = require('../src/services/supabase');

async function debug() {
  console.log('--- Database Debugger ---');

  // 1. Check Jobs Table
  const { count: jobCount, error: jobError } = await supabaseAdmin
    .from('jobs')
    .select('*', { count: 'exact', head: true });
  
  if (jobError) console.error('Error fetching jobs count:', jobError.message);
  console.log(`Total Jobs in DB: ${jobCount}`);

  if (jobCount > 0) {
    const { data: firstJobs } = await supabaseAdmin.from('jobs').select('source, title, posted_at, created_at').limit(3);
    console.log('Sample Jobs:', firstJobs);
  }

  // 2. Check User Preferences
  const { data: prefs, error: perfError } = await supabaseAdmin.from('user_preferences').select('*');
  if (perfError) console.error('Error fetching prefs:', perfError.message);
  console.log(`User Preferences Found: ${prefs?.length}`);
  if (prefs?.length > 0) {
    console.log('Sample Pref:', prefs[0]);
  }

  // 3. Check User Matches
  const { count: matchCount, error: matchError } = await supabaseAdmin
    .from('user_jobs')
    .select('*', { count: 'exact', head: true });
  
  if (matchError) console.error('Error fetching user_jobs count:', matchError.message);
  console.log(`Total User Matches (user_jobs): ${matchCount}`);

  console.log('--- End Debug ---');
}

debug();
