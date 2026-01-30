require('dotenv').config();
const { supabaseAdmin } = require('../src/services/supabase');

async function debugJobs() {
  console.log('--- Debugging GET /api/v1/jobs ---');

  // Simulate a user ID (I'll fetch one from preferences first)
  const { data: prefs } = await supabaseAdmin.from('user_preferences').select('user_id').limit(1);
  if (!prefs || prefs.length === 0) {
    console.log('No users found in user_preferences.');
    return;
  }
  const userId = prefs[0].user_id;
  console.log('Using User ID:', userId);

  try {
    // Exact logic from routes/jobs.js
    let query = supabaseAdmin
      .from('user_jobs')
      .select('*, job:jobs(*)')
      .eq('user_id', userId)
      .eq('status', 'new')
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('❌ Supabase Query Error:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Query SUCCESS. Found jobs:', data.length);
      if (data.length > 0 && data[0].job) {
          console.log('Sample job keys:', Object.keys(data[0].job));
      }
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

debugJobs();
