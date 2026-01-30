require('dotenv').config();
const { supabaseAdmin } = require('../src/services/supabase');

async function introspect() {
  console.log('--- Introspecting jobs table columns ---');

  try {
    const { data: countData, error: countError } = await supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true });
    console.log('Test count(*):', countError ? `❌ ${countError.message}` : `✅ ROWS: ${countData || 0} (Count: ${countData === null ? 'unknown' : 'visible'})`);
    if (countError) console.log('Count Error Details:', countError);

    const { error: applyError } = await supabaseAdmin.from('jobs').select('apply_url').limit(1);
    console.log('Test apply_url:', applyError ? `❌ ${applyError.message}` : '✅ EXISTS');

    const { error: sourceError } = await supabaseAdmin.from('jobs').select('source_url').limit(1);
    console.log('Test source_url:', sourceError ? `❌ ${sourceError.message}` : '✅ EXISTS');

    const { error: typeError } = await supabaseAdmin.from('jobs').select('job_type').limit(1);
    console.log('Test job_type:', typeError ? `❌ ${typeError.message}` : '✅ EXISTS');
  } catch (err) {
    console.error('Exception:', err);
  }
}

introspect();
