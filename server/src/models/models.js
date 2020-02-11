const { sequelize } = require('../db/db');
const { DataTypes } = require('sequelize');
const { pubsub, SYNC_DB, READ_HTTP_STREAM } = require('../servers/pubsub');
// define models (DOMAIN)

const ExpenseModel = sequelize.define('expense', {
	// Model attributes are defined here
	uuid: {
		type: DataTypes.STRING,
		allowNull: false,
		primaryKey: true,
	},
	description: {
		type: DataTypes.STRING
	},
	amount: {
		type: DataTypes.DOUBLE
	}, created_at: {
		type: DataTypes.DATE
	}, currency: {
		type: DataTypes.STRING
	},
	approved: {
		type: DataTypes.BOOLEAN
	}
}, {
	timestamps: false
});


const EmployeeModel = sequelize.define('employee', {
	// Model attributes are defined here
	uuid: {
		type: DataTypes.STRING,
		allowNull: false,
		primaryKey: true,
	},
	first_name: {
		type: DataTypes.STRING
	},
	last_name: {
		type: DataTypes.STRING
	},
}, {
	timestamps: false
});

// relations
EmployeeModel.hasMany(ExpenseModel, { foreignKey: 'employee_id' });
ExpenseModel.belongsTo(EmployeeModel, { foreignKey: 'employee_id' });

// sync with db
pubsub.subscribe(SYNC_DB, async () => {
	try {
		await EmployeeModel.sync();
		await ExpenseModel.sync();
		pubsub.publish(READ_HTTP_STREAM);
	} catch (error) {
		console.error('Error syncing modesl with DB, Error:', error);
	}
});
module.exports = {
	ExpenseModel, EmployeeModel
};
