const { PubSub } = require('apollo-server-koa');

const { transactionsDbMock } = require('./transactionsDbMock')
const { startGraphQLServer } = require('./graphqlServer');
const { startHttpServer } = require('./httpServer');

const { schema } = require('./schema');

const PORT = 3001; // this should come from environment variables in a real app

const pubsub = new PubSub();

const subscription = pubsub.subscribe('transactionUpdated', (transaction) => {
	console.log(`transaction ${transaction.id} updated to status : ${transaction.status}`);
});

transactionsDbMock.setTransactionUpdateHook(pubsub);
startHttpServer({
	...startGraphQLServer({
		schema,
		context: {
			transactions: transactionsDbMock.transactions,
			pubsub,
		},
	},
	),
	port: PORT,
});

console.log(`🚀 Transactions server is running...`);
