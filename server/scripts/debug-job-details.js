require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { supabaseAdmin } = require('../src/services/supabase');

async function debugJobDetails() {
  try {
    console.log('[Debug] Fetching first job with full details...');
    
    const { data: jobs, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .limit(1);

    if (error) throw error;

    if (jobs.length === 0) {
      console.log('[Debug] No jobs found');
      return;
    }

    const job = jobs[0];
    console.log('\nJob Details:');
    console.log(`Title: ${job.title}`);
    console.log(`Company: ${job.company}`);
    console.log(`Source: ${job.source}`);
    console.log(`Location: ${job.location}`);
    console.log(`Is Remote: ${job.is_remote}`);
    console.log(`Description: ${job.description ? job.description.substring(0, 200) + '...' : 'NULL'}`);
    console.log(`Salary: ${job.salary}`);
    console.log(`Posted At: ${job.posted_at}`);

  } catch (err) {
    console.error('[Debug] Error:', err);
  }
}

debugJobDetails();
