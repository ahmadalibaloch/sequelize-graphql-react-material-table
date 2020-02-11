require('dotenv').config();


const { startGraphQLServer } = require('./servers/graphqlServer');
const { startHttpServer } = require('./servers/httpServer');

const { schema } = require('./models/schema');
const { ExpenseModel, EmployeeModel } = require('./models/models');

const request = require('request');
const JSONStream = require('JSONStream');
const es = require('event-stream');
const { pubsub, READ_HTTP_STREAM, EXPENSE_ADDED } = require('./servers/pubsub');

pubsub.subscribe(EXPENSE_ADDED, ({ count }) => {
	console.log(`expenses count: ${count}`);
});
pubsub.subscribe(READ_HTTP_STREAM, () => {
	request({ url: 'https://cashcog.xcnt.io/stream' })
		.pipe(JSONStream.parse())
		.pipe(es.mapSync(async function (expense) {
			expense.approved = false;
			try {
				await EmployeeModel.create(expense.employee);
				const saveExpense = await ExpenseModel.create(expense);
				await saveExpense.setEmployee(expense.employee.uuid);
				const count = await ExpenseModel.count();
				pubsub.publish(EXPENSE_ADDED, { expense, count });
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
