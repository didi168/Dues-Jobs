const BaseFetcher = require('./BaseFetcher');

class RemoteOKFetcher extends BaseFetcher {
  constructor() {
    super('RemoteOK');
  }

  async fetchJobs() {
    try {
      // RemoteOK API
      const url = 'https://remoteok.com/api';
      
      this.log(`Fetching from ${url}...`);

      // RemoteOK sometimes requires a user-agent to avoid blocking
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'DuesJobs-Bot/1.0 (contact: admin@dues-soft.com)'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // RemoteOK returns an array where the first element is usually metadata (legal, etc)
      // Filter out non-job items (jobs usually have 'id' or 'title')
      const jobs = Array.isArray(data) ? data.slice(1) : [];

      return jobs.map(item => ({
        title: item.position,
        company: item.company,
        location: item.location,
        is_remote: true,
        source: 'RemoteOK',
        apply_url: item.url,
        posted_at: item.date, // Usually ISO or date string
        description: item.description,
        salary: item.salary_min ? `${item.salary_min}-${item.salary_max}` : (item.salary || null),
      }));

    } catch (err) {
      console.error(`[${this.sourceName}] Error:`, err.message);
      return [];
    }
  }
}

module.exports = RemoteOKFetcher;
