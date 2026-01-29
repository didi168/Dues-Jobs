const crypto = require('crypto');

/**
 * Generates a SHA-256 hash from a string.
 * @param {string} data 
 * @returns {string} Hex string of hash
 */
function createHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = {
  createHash,
};
