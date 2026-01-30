const BaseFetcher = require('./BaseFetcher');

class RemotiveFetcher extends BaseFetcher {
  constructor() {
    super('Remotive');
  }

  async fetchJobs() {
    try {
      // Remotive API public endpoint
      const url = 'https://remotive.com/api/remote-jobs?category=software-dev&limit=50';
      
      this.log(`Fetching from ${url}...`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Remotive format: { jobs: [ { title, company_name, candidate_required_location, url, publication_date, description, salary } ] }
      return (data.jobs || []).map(item => ({
        title: item.title,
        company: item.company_name,
        location: item.candidate_required_location,
        is_remote: true, // It's Remotive
        source: 'Remotive',
        apply_url: item.url,
        posted_at: item.publication_date,
        description: item.description,
        salary: item.salary,
      }));

    } catch (err) {
      console.error(`[${this.sourceName}] Error:`, err.message);
      return [];
    }
  }
}

module.exports = RemotiveFetcher;
