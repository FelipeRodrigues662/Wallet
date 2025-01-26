const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const walletController = require('../controllers/walletController.js');
const authMiddleware = require('../middleware/auth.js');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/auth/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful
 */
router.post('/auth/login', authController.login);

/**
 * @swagger
 * /api/wallet/balance:
 *   get:
 *     tags: [Wallet]
 *     summary: Get user's wallet balance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns wallet balance
 */
router.get('/wallet/balance', authMiddleware, walletController.getBalance);

/**
 * @swagger
 * /api/wallet/deposit:
 *   post:
 *     tags: [Wallet]
 *     summary: Add funds to wallet
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       202:
 *         description: Deposit request received
 */
router.post('/wallet/deposit', authMiddleware, walletController.deposit);

/**
 * @swagger
 * /api/wallet/transfer:
 *   post:
 *     tags: [Wallet]
 *     summary: Transfer funds to another user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               toUserId:
 *                 type: string
 *     responses:
 *       202:
 *         description: Transfer request received
 */
router.post('/wallet/transfer', authMiddleware, walletController.transfer);

/**
 * @swagger
 * /api/wallet/transactions:
 *   get:
 *     tags: [Wallet]
 *     summary: Get user's transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: End date for filtering
 *     responses:
 *       200:
 *         description: Returns list of transactions
 */
router.get('/wallet/transactions', authMiddleware, walletController.getTransactions);

module.exports = router;