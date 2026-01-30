require('dotenv').config();
const { supabaseAdmin } = require('../src/services/supabase');

async function inspect() {
  console.log('--- Inspecting Database ---');

  const tables = ['user_preferences', 'jobs', 'user_jobs', 'fetch_logs'];
  
  for (const table of tables) {
    const { count, error } = await supabaseAdmin
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`Error checking ${table}:`, error.message);
    } else {
      console.log(`${table}: ${count} rows`);
    }
  }

  // Check one row of user_jobs to see schema
  const { data: sample } = await supabaseAdmin.from('user_jobs').select('*').limit(1);
  console.log('Sample user_job:', sample);
}

inspect();
