require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { supabaseAdmin } = require('../src/services/supabase');
const JobMatcher = require('../src/services/JobMatcher');

async function testMatching() {
  try {
    console.log('[Test] Fetching user preferences...');
    const { data: prefs } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
      .limit(1);

    if (!prefs || prefs.length === 0) {
      console.log('[Test] No preferences found');
      return;
    }

    const pref = prefs[0];
    console.log('\nUser Preferences:');
    console.log(JSON.stringify(pref, null, 2));

    console.log('\n[Test] Fetching jobs...');
    const { data: jobs } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .limit(50);

    console.log(`\n[Test] Testing matcher with ${jobs.length} jobs...`);
    const matches = JobMatcher.match(pref, jobs);
    console.log(`\n[Test] Found ${matches.length} matches`);

    if (matches.length > 0) {
      console.log('\nMatched Jobs:');
      matches.forEach(job => {
        console.log(`  - ${job.title} (${job.source})`);
      });
    } else {
      console.log('\n[Test] No matches found. Testing individual filters...');
      
      jobs.slice(0, 3).forEach(job => {
        console.log(`\nJob: ${job.title}`);
        
        // Test source filter
        const sourceMatch = pref.sources.length === 0 || pref.sources.includes(job.source);
        console.log(`  Source Match (${pref.sources}): ${sourceMatch}`);
        
        // Test remote filter
        const remoteMatch = !pref.remote_only || job.is_remote;
        console.log(`  Remote Match (remote_only=${pref.remote_only}): ${remoteMatch}`);
        
        // Test keyword filter
        if (pref.keywords.length > 0) {
          const text = `${job.title} ${job.description || ''}`.toLowerCase();
          const keywordMatches = pref.keywords.map(kw => ({
            keyword: kw,
            found: text.includes(kw.toLowerCase())
          }));
          console.log(`  Keyword Matches:`);
          keywordMatches.forEach(km => {
            console.log(`    - "${km.keyword}": ${km.found}`);
          });
        }
      });
    }

  } catch (err) {
    console.error('[Test] Error:', err);
  }
}

testMatching();
