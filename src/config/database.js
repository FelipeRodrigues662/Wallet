const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'mariadb',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  dialect: 'mariadb',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'digital_wallet',
  logging: false
});

module.exports = sequelize;