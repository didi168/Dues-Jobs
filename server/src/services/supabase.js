const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase URL or Service Role Key missing. Database operations will fail.');
}

console.log(`[Supabase] Initializing with URL: ${process.env.SUPABASE_URL}`);
console.log(`[Supabase] Service Role Key prefix: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + '...' : 'MISSING'}`);

const supabaseAdmin = createClient(
  (process.env.SUPABASE_URL || '').trim(),
  (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

module.exports = {
  supabaseAdmin,
};
