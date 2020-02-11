const graphql = require('graphql');
const { EmployeeModel, ExpenseModel } = require('./models');
const { Op, Sequelize } = require("sequelize");

// Define the GraphQL schema
const Expense = new graphql.GraphQLObjectType({
	name: 'Expense',
	sqlTable: 'expenses',
	uniqueKey: 'id',
	fields: () => ({
		uuid: { type: graphql.GraphQLString },
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
		uuid: { type: graphql.GraphQLString },
		first_name: { type: graphql.GraphQLString },
		last_name: { type: graphql.GraphQLString },
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
const PaginationType = new graphql.GraphQLObjectType({
	name: 'Pagination',
	fields: {
		expenses: { type: new graphql.GraphQLList(Expense) },
		count: { type: graphql.GraphQLInt },
		hasNextPage: { type: graphql.GraphQLBoolean },
	}
});
const QueryRoot = new graphql.GraphQLObjectType({
	name: 'Query',
	fields: () => ({
		expenses: {
			type: PaginationType,
			args: {
				page: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
				pageSize: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
				search: { type: graphql.GraphQLString }
			},
			resolve: async (parent, args, context, resolveInfo) => {
				const search = args.search || '';
				const searchSQL = "%" + search + "%";
				const offset = args.page * args.pageSize;
				const limit = args.pageSize;
				const where = {
					[Op.or]: [
						{ '$employee.first_name$': { [Op.iLike]: searchSQL } },
						{ '$employee.last_name$': { [Op.iLike]: searchSQL } },
						{ currency: { [Op.iLike]: searchSQL } },
						{ description: { [Op.iLike]: searchSQL } },
						Sequelize.where(
							Sequelize.cast(Sequelize.col('amount'), 'varchar'),
							Op.iLike,
							searchSQL
						),
						Sequelize.where(
							Sequelize.cast(Sequelize.col('created_at'), 'varchar'),
							Op.iLike,
							searchSQL
						),
					],
				};
				const count = await ExpenseModel.count(); // bug in findAndCountAll
				const expenses = await ExpenseModel.findAll({ limit, include: [EmployeeModel], where });
				return { expenses: expenses.splice(0, offset), count, hasNextPage: count > offset };
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