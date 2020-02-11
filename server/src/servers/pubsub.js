const { PubSub } = require('apollo-server-koa');
const pubsub = new PubSub();
const READ_HTTP_STREAM = 'READ_HTTP_STREAM';
const SYNC_DB = 'SYNC_DB';
const EXPENSE_ADDED = 'EXPENSE_ADDED';

module.exports = {
	pubsub,
	READ_HTTP_STREAM,
	SYNC_DB,
	EXPENSE_ADDED
}
