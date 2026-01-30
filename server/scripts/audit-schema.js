require('dotenv').config();
const { supabaseAdmin } = require('../src/services/supabase');

async function audit() {
  console.log('--- Database Schema Audit ---');

  const tables = ['jobs', 'user_jobs', 'user_preferences', 'fetch_logs'];

  for (const table of tables) {
    console.log(`\nTable: ${table}`);
    try {
      // Fetch one row to see columns
      const { data, error } = await supabaseAdmin.from(table).select('*').limit(1);
      
      if (error) {
        console.error(`  ❌ Error fetching from ${table}:`, error.message);
        if (error.code === '42P01') console.error('     (Relation does not exist)');
      } else {
        console.log(`  ✅ Table exists. Result rows: ${data.length}`);
        if (data.length > 0) {
          console.log('  Columns:', Object.keys(data[0]).join(', '));
        } else {
          // If no rows, try a different trick to get columns via a dummy insert or just select empty
          const { data: cols, error: colError } = await supabaseAdmin.from(table).select('*').limit(0);
          // Actually supabase-js doesn't give metadata easily.
          // Let's try to fetch from information_schema.columns?
          // No, usually requires direct postgres connection.
          console.log('  (No data to show columns. Suggesting a dummy fetch)');
        }
      }
    } catch (err) {
      console.error(`  ❌ Exception on ${table}:`, err.message);
    }
  }
}

audit();
