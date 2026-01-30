const BaseFetcher = require('./BaseFetcher');

class AdzunaFetcher extends BaseFetcher {
  constructor() {
    super('Adzuna');
  }

  async fetchJobs() {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      this.log('Skipping: Missing API Credentials (ADZUNA_APP_ID/KEY)');
      return [];
    }

    try {
      // Default to GB (UK) or generic, and 'developer' search?
      // User might want configurable country/term. For now, default to broad 'developer' in 'gb' or 'us'.
      // Better: check if we can fetch widely. Adzuna requires country code in URL.
      // Let's try 'gb' as default or make it configurable. 
      const country = process.env.ADZUNA_COUNTRY || 'gb'; 
      const term = 'developer'; 
      
      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=50&what=${term}&content-type=application/json`;
      
      this.log(`Fetching from ${url.replace(appId, '***').replace(appKey, '***')}...`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Map Adzuna format to our raw job format
      // Adzuna result item: { title, company: { display_name }, location: { display_name }, redirect_url, created, description }
      return (data.results || []).map(item => ({
        title: item.title,
        company: item.company?.display_name || 'Unknown',
        location: item.location?.display_name,
        is_remote: (() => {
           // Heuristic: Check if 'remote' is in title, location or description
           const combined = `${item.title} ${item.location?.display_name} ${item.description}`.toLowerCase();
           return combined.includes('remote') || combined.includes('work from home');
        })(), 
        source: 'Adzuna',
        apply_url: item.redirect_url,
        posted_at: item.created,
        description: item.description,
        salary: item.salary_min ? `${item.salary_min} - ${item.salary_max}` : null,
      }));

    } catch (err) {
      console.error(`[${this.sourceName}] Error:`, err.message);
      return [];
    }
  }
}

module.exports = AdzunaFetcher;
