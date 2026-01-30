const BaseFetcher = require('./BaseFetcher');

class IndeedFetcher extends BaseFetcher {
  constructor() { super('Indeed'); }
  async fetchJobs() {
    this.log('Fetching from Indeed (Mock)...');
    return [
      {
        title: 'Product Manager',
        company: 'BizInc',
        location: 'New York, NY',
        is_remote: false,
        source: 'Indeed',
        apply_url: 'https://indeed.com/viewjob?jk=123',
        posted_at: new Date().toISOString(),
        description: 'Lead our product team.',
      }
    ];
  }
}

class WellfoundFetcher extends BaseFetcher {
  constructor() { super('Wellfound'); }
  async fetchJobs() {
    this.log('Fetching from Wellfound (Mock)...');
    return [
      {
        title: 'Founding Engineer',
        company: 'Stealth Startup',
        location: 'Remote',
        is_remote: true,
        source: 'Wellfound',
        apply_url: 'https://wellfound.com/jobs/999',
        posted_at: new Date().toISOString(),
        description: 'Build from scratch.',
        salary: '2.0% - 5.0% Equity',
      }
    ];
  }
}

class ArcFetcher extends BaseFetcher {
  constructor() { super('Arc.dev'); }
  async fetchJobs() {
    this.log('Fetching from Arc.dev (Mock)...');
    return [
      {
        title: 'Remote React Developer',
        company: 'Global Teams',
        location: 'Remote',
        is_remote: true,
        source: 'Arc.dev',
        apply_url: 'https://arc.dev/j/555',
        posted_at: new Date().toISOString(),
        description: 'Work from anywhere.',
        salary: '$60k - $100k',
      }
    ];
  }
}

module.exports = {
  IndeedFetcher,
  WellfoundFetcher,
  ArcFetcher,
};
