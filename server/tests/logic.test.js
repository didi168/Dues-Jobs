const JobNormalizer = require('../src/services/JobNormalizer');
const JobMatcher = require('../src/services/JobMatcher');

describe('JobNormalizer', () => {
  test('should normalize job and create canonical hash', () => {
    const raw = {
      title: '  Senior Dev  ',
      company: '  Google ',
      location: 'New York',
      is_remote: false
    };
    const norm = JobNormalizer.normalize(raw);
    
    expect(norm.title).toBe('Senior Dev');
    expect(norm.company).toBe('Google');
    expect(norm.canonical_hash).toBeDefined();
  });

  test('should treat remote jobs consistently', () => {
    const raw1 = { title: 'Dev', company: 'A', location: 'SF', is_remote: true };
    const raw2 = { title: 'Dev', company: 'A', location: 'NY', is_remote: true };
    
    const norm1 = JobNormalizer.normalize(raw1);
    const norm2 = JobNormalizer.normalize(raw2);
    
    // Remote jobs with same title/company should usually hash same, 
    // but our implementation uses "Remote" as location for hash if is_remote is true.
    expect(norm1.canonical_hash).toBe(norm2.canonical_hash);
  });
});

describe('JobMatcher', () => {
  const jobs = [
    { title: 'React Dev', description: 'Frontend work', location: 'NY', is_remote: false, source: 'LinkedIn' },
    { title: 'Node Backend', description: 'API work', location: 'Remote', is_remote: true, source: 'Indeed' },
    { title: 'Java Eng', description: 'Enterprise', location: 'SF', is_remote: false, source: 'LinkedIn' }
  ];

  test('should match by keyword', () => {
    const prefs = { keywords: ['React'] };
    const matches = JobMatcher.match(prefs, jobs);
    expect(matches.length).toBe(1);
    expect(matches[0].title).toBe('React Dev');
  });

  test('should match by location', () => {
    const prefs = { locations: ['NY'] };
    const matches = JobMatcher.match(prefs, jobs);
    expect(matches.length).toBe(2); // Matches NY job AND Remote job (implicit match)
    expect(matches.map(m => m.title)).toEqual(expect.arrayContaining(['React Dev', 'Node Backend']));
  });

  test('should match remote only', () => {
    const prefs = { remote_only: true };
    const matches = JobMatcher.match(prefs, jobs);
    expect(matches.length).toBe(1);
    expect(matches[0].title).toBe('Node Backend');
  });

  test('should match by source', () => {
    const prefs = { sources: ['Indeed'] };
    const matches = JobMatcher.match(prefs, jobs);
    expect(matches.length).toBe(1);
    expect(matches[0].source).toBe('Indeed');
  });
  
  test('should match multiple criteria', () => {
    const prefs = { keywords: ['Backend'], remote_only: true };
    const matches = JobMatcher.match(prefs, jobs);
    expect(matches.length).toBe(1);
    expect(matches[0].title).toBe('Node Backend');
  });
});
