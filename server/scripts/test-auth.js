require('dotenv').config();
const { supabaseAdmin } = require('../src/services/supabase');

async function testAuth() {
  console.log('--- Auth Admin Test ---');
  
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
       console.error('❌ Auth Admin FAILED:', JSON.stringify(error, null, 2));
    } else {
       console.log('✅ Auth Admin SUCCESS. Found users:', users.length);
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

testAuth();
