require('dotenv').config();
const { supabaseAdmin } = require('../src/services/supabase');

async function probe() {
  console.log('--- Brute Force Table Probe ---');
  
  const potentialTables = ['jobs', 'user_jobs', 'user_preferences', 'fetch_logs', 'Profiles', 'Users', 'Jobs'];
  
  for (const table of potentialTables) {
    const { error } = await supabaseAdmin.from(table).select('*').limit(0);
    if (!error) {
      console.log(`✅ Table [${table}] is VISIBLE`);
    } else {
      console.log(`❌ Table [${table}]: ${error.code} - ${error.message}`);
    }
  }
}

probe();
