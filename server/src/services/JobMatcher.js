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
      // 1. Source Filter
      if (sources.length > 0 && !sources.includes(job.source)) {
        return false;
      }

      // 2. Remote Filter
      if (remote_only && !job.is_remote) {
        return false;
      }

      // 3. Location Filter (if not remote-only and locations provided)
      // If remote_only is false, we verify location matches IF locations list is not empty.
      // If job is remote, it usually matches 'Remote' preference, but here we check explicit location list.
      // If locations is empty, we assume ANY location is fine (unless remote_only is set).
      if (!remote_only && locations.length > 0) {
        const jobLoc = (job.location || '').toLowerCase();
        // Check if any preferred location is a substring of the job location
        const locMatch = locations.some(loc => jobLoc.includes(loc.toLowerCase()));
        if (!locMatch && !job.is_remote) return false; // Fail if not remote and location doesn't match
        // If job is remote, we might allow it even if location doesn't match, or strictly follow logic.
        // Let's assume if it's remote, it's valid for "Location: NY" user? Usually yes? 
        // Simplification: If locations specified, job must match location OR be remote?
        // Let's stick to strict: If locations specified, look for match.
        if (!locMatch && job.is_remote) {
           // Allow remote jobs even if location filter exists? Usually yes.
        } else if (!locMatch) {
           return false;
        }
      }

      // 4. Keyword Filter - Case insensitive search in Title or Description
      if (keywords.length > 0) {
        const text = `${job.title} ${job.description}`.toLowerCase();
        const keywordMatch = keywords.some(keyword => text.includes(keyword.toLowerCase()));
        if (!keywordMatch) return false;
      }

      return true;
    });
  }
}

module.exports = JobMatcher;
