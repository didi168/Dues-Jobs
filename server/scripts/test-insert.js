require('dotenv').config();
const { supabaseAdmin } = require('../src/services/supabase');

async function testInsert() {
  console.log('--- Force Insert Test ---');
  
  const dummyJob = {
    title: 'Permission Test Job',
    company: 'Audit Co',
    location: 'Remote',
    is_remote: true,
    source: 'Audit',
    apply_url: 'https://example.com',
    canonical_hash: 'test-hash-' + Date.now(),
    posted_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert(dummyJob)
      .select();

    if (error) {
      console.error('❌ Insert FAILED:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Insert SUCCESS:', data);
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

testInsert();
