const LinkedInFetcher = require('./LinkedInFetcher');
const AdzunaFetcher = require('./AdzunaFetcher');
const RemotiveFetcher = require('./RemotiveFetcher');
const RemoteOKFetcher = require('./RemoteOKFetcher');
// const { IndeedFetcher, WellfoundFetcher, ArcFetcher } = require('./OtherFetchers');

// Export an array of instantiated fetchers
const fetchers = [
  new AdzunaFetcher(),
  new RemotiveFetcher(),
  new RemoteOKFetcher(),
  // new IndeedFetcher(),
  // new WellfoundFetcher(),
  // new ArcFetcher(),
];

module.exports = fetchers;
