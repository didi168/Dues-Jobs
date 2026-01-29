require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data, error } = await supabase.from('jobs').select('*').limit(1);
  if (error) console.error('DB connection error:', error);
  else console.log('DB connection successful:', data);
})();
