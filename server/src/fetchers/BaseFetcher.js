class BaseFetcher {
  constructor(sourceName) {
    this.sourceName = sourceName;
  }

  /**
   * Fetches jobs from the source.
   * @returns {Promise<Array>} List of raw job objects
   */
  async fetchJobs() {
    throw new Error('fetchJobs() must be implemented by subclass');
  }

  log(message) {
    console.log(`[${this.sourceName}] ${message}`);
  }
}

module.exports = BaseFetcher;
