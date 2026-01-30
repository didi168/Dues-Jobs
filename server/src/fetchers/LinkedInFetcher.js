const BaseFetcher = require('./BaseFetcher');

class LinkedInFetcher extends BaseFetcher {
  constructor() {
    super('LinkedIn');
  }

  async fetchJobs() {
    this.log('Fetching from LinkedIn (Mock)...');
    
    // Mock Data
    return [
      {
        title: 'Senior Frontend Engineer',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        is_remote: false,
        source: 'LinkedIn',
        apply_url: 'https://linkedin.com/jobs/view/123456',
        posted_at: new Date().toISOString(),
        description: 'We are looking for a Senior Frontend Engineer with React experience.',
        salary: '$150k - $180k',
      },
      {
        title: 'Backend Developer (Node.js)',
        company: 'StartupX',
        location: 'Remote',
        is_remote: true,
        source: 'LinkedIn',
        apply_url: 'https://linkedin.com/jobs/view/789012',
        posted_at: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
        description: 'Join our backend team building scalable APIs.',
        salary: '$120k - $160k',
      }
    ];
  }
}

module.exports = LinkedInFetcher;
