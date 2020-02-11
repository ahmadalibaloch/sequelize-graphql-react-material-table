const { PubSub } = require('apollo-server-koa');
const pubsub = new PubSub();

module.exports.pubsub = pubsub;
