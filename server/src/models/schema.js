const graphql = require('graphql');
const { EXPENSE_ADDED } = require('../servers/pubsub');
const { EmployeeModel, ExpenseModel } = require('./models');
const { Date } = require('./graphqlDate');

// Define the GraphQL schema
const Expense = new graphql.GraphQLObjectType({
	name: 'Expense',
	sqlTable: 'expenses',
	uniqueKey: 'id',
	fields: () => ({
		uuid: { type: graphql.GraphQLString },
		description: { type: graphql.GraphQLString },
		amount: { type: graphql.GraphQLInt },
		created_at: { type: Date },
		currency: { type: graphql.GraphQLString },
		approved: { type: graphql.GraphQLBoolean },
		employee: {
			type: Employee,
		}
	})
});

var Employee = new graphql.GraphQLObjectType({
	name: 'Employee',
	fields: () => ({
		uuid: { type: graphql.GraphQLString },
		first_name: { type: graphql.GraphQLString },
		last_name: { type: graphql.GraphQLString },
		expenses: {
			type: graphql.GraphQLList(Expense),
		}
	})
})

// Define Graphql Roots
const expenseAddedType = new graphql.GraphQLObjectType({
	name: 'ExpenseAdded',
	fields: () => ({
		expense: { type: Expense },
		count: { type: graphql.GraphQLInt },
	})
});
const SubscriptionRoot = new graphql.GraphQLObjectType({
	name: 'Subscription',
	fields: () => ({
		expenseAdded: {
			type: expenseAddedType,
			subscribe: (root, args, context) => context.pubsub.asyncIterator(EXPENSE_ADDED),
			resolve: expense => expense,
		}
	})
})

const MutationRoot = new graphql.GraphQLObjectType({
	name: 'Mutation',
	fields: () => ({
		setExpenseApproval: {
			type: Expense,
			args: {
				approved: { type: graphql.GraphQLNonNull(graphql.GraphQLBoolean) },
				uuid: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
			},
			resolve: async (parent, args, context, resolveInfo) => {
				try {
					const result = (await ExpenseModel.update({ approved: args.approved }, { where: { uuid: args.uuid } }));
					console.log('result', JSON.stringify(result));
					if (result[0] != 1) {
						throw "Error updating expense";
					}
					const expense = (await ExpenseModel.findAll({ where: { uuid: args.uuid }, include: [EmployeeModel] }))[0];
					context.pubsub.publish('expenseAdded', expense);
					return expense;
				} catch (err) {
					throw new Error(err)
				}
			}
		}
	})
})

const QueryRoot = new graphql.GraphQLObjectType({
	name: 'Query',
	fields: () => ({
		expenses: {
			type: new graphql.GraphQLList(Expense),
			resolve: (parent, args, context, resolveInfo) => {
				return ExpenseModel.findAll({ include: [EmployeeModel] });
			}
		},
		expense: {
			type: Expense,
			args: { uuid: { type: graphql.GraphQLNonNull(graphql.GraphQLString) } },
			resolve: (parent, args, context, resolveInfo) => {
				return ExpenseModel.findByPk(args.uuid, { include: [EmployeeModel] });
			}
		},
		employees: {
			type: new graphql.GraphQLList(Employee),
			resolve: (parent, args, context, resolveInfo) => {
				return EmployeeModel.findAll({ include: [ExpenseModel] });
			}
		},
		employee: {
			type: Employee,
			args: { uuid: { type: graphql.GraphQLNonNull(graphql.GraphQLString) } },
			resolve: (parent, args, context, resolveInfo) => {
				return EmployeeModel.findByPk(args.uuid, { include: [ExpenseModel] });
			}
		},
	})
})

module.exports.schema = new graphql.GraphQLSchema({
	query: QueryRoot,
	mutation: MutationRoot,
	subscription: SubscriptionRoot,
});