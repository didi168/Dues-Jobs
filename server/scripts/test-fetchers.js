const RemotiveFetcher = require('../src/fetchers/RemotiveFetcher');
const RemoteOKFetcher = require('../src/fetchers/RemoteOKFetcher');
const JobNormalizer = require('../src/services/JobNormalizer');

async function test() {
  console.log('--- Testing Fetchers ---');

  // Test Remotive (Public)
  try {
    console.log('\n1. Testing RemotiveFetcher...');
    const remotive = new RemotiveFetcher();
    const jobs1 = await remotive.fetchJobs();
    console.log(`✅ Remotive returned ${jobs1.length} jobs.`);
    if (jobs1.length > 0) {
      const norm = JobNormalizer.normalize(jobs1[0]);
      console.log('Sample Normalized Job:', JSON.stringify(norm, null, 2));
    }
  } catch (err) {
    console.error('❌ Remotive Failed:', err.message);
  }

  // Test RemoteOK (Public)
  try {
    console.log('\n2. Testing RemoteOKFetcher...');
    const remoteok = new RemoteOKFetcher();
    const jobs2 = await remoteok.fetchJobs();
    console.log(`✅ RemoteOK returned ${jobs2.length} jobs.`);
    if (jobs2.length > 0) {
      const norm = JobNormalizer.normalize(jobs2[0]);
      console.log('Sample Normalized Job:', JSON.stringify(norm, null, 2));
    }
  } catch (err) {
    console.error('❌ RemoteOK Failed:', err.message);
  }

  console.log('\n--- Test Complete ---');
}

test();
