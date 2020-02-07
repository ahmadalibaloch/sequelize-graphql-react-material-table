const { PubSub } = require('apollo-server-koa');
const pubsub = new PubSub();

module.exports.transactionsDbMock = {
	transactions: [
		{
			id: '60aeffc6',
			fromUser: 'abc',
			toUser: 'cba',
			amount: '33',
			status: 'pending',
			date: '2 January, 2019',
		},
		{
			id: '61bfggd7',
			fromUser: 'def',
			toUser: 'fed',
			amount: '44',
			status: 'pending',
			date: '12 Oct, 2019',
		},
		{
			id: '62cghhe8',
			fromUser: 'ghi',
			toUser: 'ihg',
			amount: '55',
			status: 'pending',
			date: '14 June, 2018',
		},
		{
			id: '63dhiif9',
			fromUser: 'jkl',
			toUser: 'lkj',
			amount: '66',
			status: 'pending',
			date: '13 June, 2017',
		},
	],
	
	// ideally the below methods functionality will go into a service layer on server side
	markTransactionAllowed: (transaction) => {
		transaction.status = 'allowed';
	},

	markTransactionBlocked: (transaction) => {
		transaction.status = 'blocked';
	},

	updateTransactionStatus: (transactionId, allow) => {
		const transaction = this.transactionsDbMock.transactions.find(t => t.id === transactionId);
		if (allow) {
			this.transactionsDbMock.markTransactionAllowed(transaction);
		} else {
			this.transactionsDbMock.markTransactionBlocked(transaction);
		}
		this.onUpdate(transaction);
		return transaction;
	},

	setTransactionUpdateHook: (pubsub) => {
		// pubsub is initialized in index.js
		this.onUpdate = (transaction) => {
			pubsub.publish('transactionUpdated', transaction)
		};
	}
};
