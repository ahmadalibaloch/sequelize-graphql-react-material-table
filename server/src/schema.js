const { gql } = require('apollo-server-koa');
const { makeExecutableSchema } = require('graphql-tools');
const { transactionsDbMock } = require('./transactionsDbMock')
const { filter } = require('lodash');

const typeDefs = gql`
    type Query {
        status: String!
        transactions(id:String, status:String): [Transaction!]!
        pendingTransactions: [Transaction!]
    }

    type Subscription {
        transactionUpdated: Transaction
	}
	
	type Mutation {
		allowTransaction(id:String!) : Transaction
		blockTransaction(id:String!) : Transaction
	}

    type Transaction {
        id: String!
        fromUser: String!
		toUser: String!
		amount: String!
		status: String!
		date: String!
    }
`;

// defining the resolver with typeDef for easy access, if app grows we need to define them in proper files
const resolvers = {
	Query: {
		status: () => 'GraphQL yay!',
		transactions: (root, args, context) => {
			return filter(context.transactions, args);
		},
		pendingTransactions: (_, __, context) => {
			return filter(context.transactions, { status: 'pending' }); 
		},
	},
	Mutation: {
		allowTransaction: (root, args, context) => {
			return transactionsDbMock.updateTransactionStatus(args.id, true);
		},
		blockTransaction: (root, args, context) => {
			return transactionsDbMock.updateTransactionStatus(args.id, false);
		},
	},
	Subscription: {
		transactionUpdated: {
			subscribe: (root, args, context) => context.pubsub.asyncIterator('transactionUpdated'),
			resolve: transaction => transaction,
		},
	},
};

module.exports.schema = makeExecutableSchema({
	typeDefs,
	resolvers,
});
