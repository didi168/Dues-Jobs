const LinkedInFetcher = require('./LinkedInFetcher');
const { IndeedFetcher, WellfoundFetcher, ArcFetcher } = require('./OtherFetchers');

// Instantiate all fetchers
const fetchers = [
  new LinkedInFetcher(),
  new IndeedFetcher(),
  new WellfoundFetcher(),
  new ArcFetcher(),
];

module.exports = fetchers;
