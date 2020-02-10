require('dotenv').config();

const { Readable } = require('stream');
const { PubSub } = require('apollo-server-koa');

const { startGraphQLServer } = require('./servers/graphqlServer');
const { startHttpServer } = require('./servers/httpServer');

const { schema } = require('./models/schema');

const https = require('https');


const pubsub = new PubSub();

const subscription = pubsub.subscribe('expenseAdded', (expense) => {
	console.log(`transaction ${expense.id} updated to status : ${expense.approved}`);
});

startHttpServer({
	...startGraphQLServer({
		schema,
		context: {
			expenses: [],
			pubsub,
		},
	},
	),
	port: process.env.GRAPHQL_PORT,
});

console.log(`🚀 Server is running...`);
