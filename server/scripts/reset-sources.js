require('dotenv').config();
const { supabaseAdmin } = require('../src/services/supabase');
const JobMatcher = require('../src/services/JobMatcher');

async function reset() {
  console.log('--- Resetting Sources & Rematching ---');

  // 1. Force update all users to use ONLY the new sources
  const newSources = ['Adzuna', 'Remotive', 'RemoteOK'];
  
  const { data: users, error } = await supabaseAdmin.from('user_preferences').select('user_id');
  
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log(`Updating ${users.length} users to sources: ${newSources.join(', ')}`);

  for (const user of users) {
    await supabaseAdmin
      .from('user_preferences')
      .update({ sources: newSources })
      .eq('user_id', user.user_id);
  }

  // 2. Clear old matches? No, just add new ones.
  // Actually, if we want to be clean, maybe we ignore old matches.
  // But let's just trigger a match run against all jobs.

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
       
       const { error: matchError } = await supabaseAdmin
        .from('user_jobs')
        .upsert(userJobRecords, { onConflict: 'user_id,job_id', ignoreDuplicates: true });

       if (matchError) console.error(matchError);
       else console.log(`  > User ${pref.user_id}: +${matches.length} matches`);
    } else {
       console.log(`  > User ${pref.user_id}: 0 matches found.`);
    }
  }

  console.log('--- Reset Complete ---');
}

reset();
