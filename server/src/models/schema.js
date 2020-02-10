const graphql = require('graphql');
const { EmployeeModel, ExpenseModel } = require('./models');

// Define the GraphQL schema
const Expense = new graphql.GraphQLObjectType({
	name: 'Expense',
	sqlTable: 'expenses',
	uniqueKey: 'id',
	fields: () => ({
		id: { type: graphql.GraphQLString },
		description: { type: graphql.GraphQLString },
		amount: { type: graphql.GraphQLInt },
		created_at: { type: graphql.GraphQLString },
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
		id: { type: graphql.GraphQLString },
		name: { type: graphql.GraphQLString },
		expenses: {
			type: graphql.GraphQLList(Expense),
		}
	})
})

// Define Graphql Roots
const SubscriptionRoot = new graphql.GraphQLObjectType({
	name: 'Subscription',
	fields: () => ({
		expenseAdded: {
			type: Expense,
			subscribe: (root, args, context) => context.pubsub.asyncIterator('expenseAdded'),
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
				id: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
			},
			resolve: async (parent, args, context, resolveInfo) => {
				try {
					const result = (await ExpenseModel.update({ approved: args.approved }, { where: { id: args.id } }));
					console.log('result', JSON.stringify(result));
					if (result[0] != 1) {
						throw "Error updating expense";
					}
					const expense = (await ExpenseModel.findAll({ where: { id: args.id }, include: [EmployeeModel] }))[0];
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
			args: { id: { type: graphql.GraphQLNonNull(graphql.GraphQLString) } },
			resolve: (parent, args, context, resolveInfo) => {
				return ExpenseModel.findByPk(args.id, { include: [EmployeeModel] });
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
			args: { id: { type: graphql.GraphQLNonNull(graphql.GraphQLString) } },
			resolve: (parent, args, context, resolveInfo) => {
				return EmployeeModel.findByPk(args.id, { include: [ExpenseModel] });
			}
		},
	})
})

module.exports.schema = new graphql.GraphQLSchema({
	query: QueryRoot,
	mutation: MutationRoot,
	subscription: SubscriptionRoot,
});