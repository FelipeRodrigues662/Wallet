const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'mariadb',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'digital_wallet',
  port:3306,
  logging: false
});

module.exports = sequelize;