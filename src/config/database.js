const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'digital_wallet',
  logging: false
});

module.exports = sequelize;