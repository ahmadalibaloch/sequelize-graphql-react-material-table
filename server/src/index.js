require('dotenv').config();


const { startGraphQLServer } = require('./servers/graphqlServer');
const { startHttpServer } = require('./servers/httpServer');

const { schema } = require('./models/schema');
const { ExpenseModel, EmployeeModel } = require('./models/models');

const request = require('request');
const JSONStream = require('JSONStream');
const es = require('event-stream');
const { pubsub } = require('./servers/pubsub');

pubsub.subscribe('expenseAdded', (expense) => {
	console.log(`transaction ${expense.uuid} updated to status : ${expense.approved}`);
});
pubsub.subscribe('startReadingExpenseStream', () => {
	request({ url: 'https://cashcog.xcnt.io/stream' })
		.pipe(JSONStream.parse())
		.pipe(es.mapSync(async function (expense) {
			expense.approved = false;
			try {
				await EmployeeModel.create(expense.employee);
				const saveExpense = await ExpenseModel.create(expense);
				saveExpense.setEmployee(expense.employee.uuid);
			} catch (ex) {
				console.error('Error', ex.message);
			}
		}));
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
