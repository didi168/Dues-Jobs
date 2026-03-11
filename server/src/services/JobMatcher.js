class JobMatcher {
  /**
   * Matches a list of jobs against a user's preferences.
   * @param {Object} userPreferences - { keywords, locations, remote_only, sources }
   * @param {Array} jobs - List of normalized job objects
   * @returns {Array} List of matching jobs
   */
  static match(userPreferences, jobs) {
    const {
      keywords = [],
      locations = [],
      remote_only = false,
      sources = [],
    } = userPreferences;

    return jobs.filter(job => {
      // 1. Source Filter - Must match if sources are specified
      if (sources && sources.length > 0) {
        if (!sources.includes(job.source)) {
          return false;
        }
      }

      // 2. Remote Filter - If remote_only is true, job must be remote
      if (remote_only && !job.is_remote) {
        return false;
      }

      // 3. Location Filter - Only apply if not remote_only and locations are specified
      if (!remote_only && locations && locations.length > 0) {
        const jobLoc = (job.location || '').toLowerCase().trim();
        
        // If job is remote, it matches any location preference
        if (job.is_remote) {
          // Remote jobs match location preferences
        } else {
          // For non-remote jobs, check if location matches
          const locMatch = locations.some(loc => 
            jobLoc.includes(loc.toLowerCase().trim())
          );
          if (!locMatch) {
            return false;
          }
        }
      }

      // 4. Keyword Filter - Match ANY keyword (not all)
      // Only apply if keywords are provided and not empty
      if (keywords && keywords.length > 0) {
        const text = `${job.title || ''} ${job.description || ''} ${job.company || ''}`.toLowerCase();
        
        // Match if ANY keyword is found in the text
        const keywordMatch = keywords.some(keyword => {
          const cleanKeyword = keyword.toLowerCase().trim();
          return cleanKeyword && text.includes(cleanKeyword);
        });
        
        if (!keywordMatch) {
          return false;
        }
      }

      return true;
    });
  }
}

module.exports = JobMatcher;
