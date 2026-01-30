require('dotenv').config();
const { supabaseAdmin } = require('../src/services/supabase');

async function debugUpdate() {
  console.log('--- Debugging Update Error ---');

  // 1. Get a valid user_job row
  const { data: userJobs, error: fetchError } = await supabaseAdmin
    .from('user_jobs')
    .select('*')
    .limit(1);

  if (fetchError) {
    console.error('Failed to fetch user_job:', fetchError);
    return;
  }

  if (userJobs.length === 0) {
    console.log('No user_jobs found to test with.');
    return;
  }

  const record = userJobs[0];
  console.log('Testing update on:', record);

  // 2. Attempt update
  try {
    const { data, error } = await supabaseAdmin
      .from('user_jobs')
      .update({ 
        status: 'applied', 
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', record.user_id)
      .eq('job_id', record.job_id)
      .select();

    if (error) {
      console.error('❌ Update FAILED with Supabase Error:', error);
    } else {
      console.log('✅ Update SUCCESS:', data);
    }
  } catch (err) {
    console.error('❌ Update FAILED with Exception:', err);
  }
}

debugUpdate();
