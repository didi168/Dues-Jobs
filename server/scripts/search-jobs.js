require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { supabaseAdmin } = require('../src/services/supabase');

async function searchJobs() {
  try {
    console.log('[Search] Fetching all jobs...');
    const { data: jobs } = await supabaseAdmin
      .from('jobs')
      .select('title, source')
      .limit(50);

    console.log(`\n[Search] Found ${jobs.length} jobs. Searching for keywords...`);
    
    const keywords = ['React', 'Frontend', 'typescript', 'engineer', 'developer'];
    
    keywords.forEach(keyword => {
      const matches = jobs.filter(job => 
        job.title.toLowerCase().includes(keyword.toLowerCase())
      );
      console.log(`\n"${keyword}": ${matches.length} matches`);
      if (matches.length > 0) {
        matches.slice(0, 3).forEach(job => {
          console.log(`  - ${job.title}`);
        });
      }
    });

  } catch (err) {
    console.error('[Search] Error:', err);
  }
}

searchJobs();
