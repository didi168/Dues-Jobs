const { createHash } = require('../utils/hasher');

class JobNormalizer {
  static normalize(rawJob) {
    const {
      title,
      company,
      location,
      is_remote,
      job_type,
      source,
      source_url, // API returns this
      apply_url,  // Or this
      posted_at,
      description,
      salary,
    } = rawJob;

    const normalizedTitle = title ? title.trim() : 'Unknown Title';
    const normalizedCompany = company ? company.trim() : 'Unknown Company';
    // If remote, use 'Remote' as location for hashing consistency if location is mixed
    const normalizedLocation = is_remote ? 'Remote' : (location ? location.trim() : 'Unknown Location');

    // Create a canonical string for hashing using key attributes
    const canonicalString = `${normalizedTitle.toLowerCase()}|${normalizedCompany.toLowerCase()}|${normalizedLocation.toLowerCase()}`;
    const canonicalHash = createHash(canonicalString);

    return {
      title: normalizedTitle,
      company: normalizedCompany,
      location: location ? location.trim() : null,
      is_remote: !!is_remote,
      job_type: job_type || (is_remote ? 'Remote' : 'Onsite'),
      source: source || 'Unknown',
      apply_url: apply_url || source_url, // Final normalized field
      posted_at: posted_at ? new Date(posted_at).toISOString() : new Date().toISOString(),
      description: description ? description.trim() : '',
      salary: salary ? salary.toString().trim() : null,
      canonical_hash: canonicalHash,
    };
  }
}

module.exports = JobNormalizer;
