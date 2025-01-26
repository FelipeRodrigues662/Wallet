const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.js');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: true,
      min: 0.01
    }
  },
  type: {
    type: DataTypes.ENUM('DEPOSIT', 'TRANSFER'),
    allowNull: false
  },
  fromUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users', // Nome da tabela referenciada
      key: 'id'
    }
  },
  toUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users', // Nome da tabela referenciada
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED'),
    defaultValue: 'PENDING'
  }
}, {
  tableName: 'transactions',  // Define nome explícito da tabela
  timestamps: true  // Adiciona campos createdAt e updatedAt automaticamente
});

module.exports = Transaction;
