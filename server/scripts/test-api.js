require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { supabaseAdmin } = require('../src/services/supabase');

async function testAPI() {
  try {
    console.log('[Test] Simulating GET /api/v1/jobs?status=new');
    
    // Get the user ID
    const { data: prefs } = await supabaseAdmin
      .from('user_preferences')
      .select('user_id')
      .limit(1);

    if (!prefs || prefs.length === 0) {
      console.log('[Test] No users found');
      return;
    }

    const userId = prefs[0].user_id;
    console.log(`[Test] Using user ID: ${userId}`);

    // Simulate the API query
    const { data, error } = await supabaseAdmin
      .from('user_jobs')
      .select('*, job:jobs(*)')
      .eq('user_id', userId)
      .eq('status', 'new')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`\n[Test] Found ${data.length} jobs`);
    
    // Transform like the API does
    const jobs = data.map(item => ({
      user_job_id: item.id,
      status: item.status,
      notes: item.notes,
      ...item.job
    }));

    console.log('\n[Test] Transformed response:');
    console.log(JSON.stringify({ data: jobs, page: 1, limit: 20 }, null, 2));

  } catch (err) {
    console.error('[Test] Error:', err);
  }
}

testAPI();
