const User = require('../models/User.js');
const Transaction = require('../models/Transaction.js');
const messageQueue = require('../services/messageQueue.js');
const { Op } = require('sequelize');

exports.getBalance = async (req, res) => {
  try {
    const user = await User.findByPk(req.userData.userId);
    res.json({ balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching balance', error: error.message });
  }
};

exports.deposit = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.userData.userId;

    const transaction = await Transaction.create({
      amount,
      type: 'DEPOSIT',
      toUserId: userId
    });

    await messageQueue.publishTransaction({
      ...transaction.toJSON(),
      action: 'PROCESS_DEPOSIT'
    });

    res.status(202).json({
      message: 'Deposit request received',
      transactionId: transaction.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing deposit', error: error.message });
  }
};

exports.transfer = async (req, res) => {
  try {
    const { amount, toUserId } = req.body;
    const fromUserId = req.userData.userId;

    const sender = await User.findByPk(fromUserId);
    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    const transaction = await Transaction.create({
      amount,
      type: 'TRANSFER',
      fromUserId,
      toUserId
    });

    await messageQueue.publishTransaction({
      ...transaction.toJSON(),
      action: 'PROCESS_TRANSFER'
    });

    res.status(202).json({
      message: 'Transfer request received',
      transactionId: transaction.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing transfer', error: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.userData.userId;

    const whereClause = {
      [Op.or]: [
        { fromUserId: userId },
        { toUserId: userId }
      ]
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const transactions = await Transaction.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};