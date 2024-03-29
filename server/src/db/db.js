
// DB layer
const { pubsub, SYNC_DB } = require('../servers/pubsub');
const { Sequelize } = require('sequelize');
// const connString = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;
const sequelize = new Sequelize("sqlite::memory:");



// test connection
(async () => {
	try {
		console.log('Connecting db...');
		await sequelize.authenticate();
		console.log('Connection has been established successfully.');
		pubsub.publish(SYNC_DB);
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}
})();

module.exports.sequelize = sequelize;