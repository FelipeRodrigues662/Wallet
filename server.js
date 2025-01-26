require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const apiRoutes = require('./src/routes/api.js');
const sequelize = require('./src/config/database.js');
const messageQueue = require('./src/services/messageQueue.js');
const User = require('./src/models/User.js');
const Transaction = require('./src/models/Transaction.js');

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Digital Wallet API',
      version: '1.0.0',
      description: 'API for managing digital wallets and financial transactions'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to database
    await sequelize.sync();
    console.log('Database connected successfully');

    // Connect to message queue
    await messageQueue.connect();
    console.log('Message queue connected successfully');

    // Start consuming messages
    await messageQueue.consumeTransactions(async (transaction) => {
      try {
        console.log('Processing transaction:', transaction);
        
        if (transaction.action === 'PROCESS_DEPOSIT') {
          const user = await User.findByPk(transaction.toUserId);
          if (!user) {
            console.error('User not found:', transaction.toUserId);
            return;
          }

          await sequelize.transaction(async (t) => {
            // Atualiza o saldo do usuário
            await user.increment('balance', { 
              by: parseFloat(transaction.amount), 
              transaction: t 
            });

            // Atualiza o status da transação
            await Transaction.update(
              { status: 'COMPLETED' },
              { 
                where: { id: transaction.id },
                transaction: t
              }
            );
          });

          console.log(`Deposit completed: User ${user.id} balance updated by ${transaction.amount}`);
        } else if (transaction.action === 'PROCESS_TRANSFER') {
          const sender = await User.findByPk(transaction.fromUserId);
          const receiver = await User.findByPk(transaction.toUserId);
          
          if (!sender || !receiver) {
            console.error('Sender or receiver not found');
            return;
          }

          await sequelize.transaction(async (t) => {
            await sender.decrement('balance', { 
              by: parseFloat(transaction.amount), 
              transaction: t 
            });
            await receiver.increment('balance', { 
              by: parseFloat(transaction.amount), 
              transaction: t 
            });
            await Transaction.update(
              { status: 'COMPLETED' },
              { 
                where: { id: transaction.id },
                transaction: t 
              }
            );
          });

          console.log(`Transfer completed: From ${sender.id} to ${receiver.id}, amount: ${transaction.amount}`);
        }
      } catch (error) {
        console.error('Error processing transaction:', error);
        // Marca a transação como falha
        await Transaction.update(
          { status: 'FAILED' },
          { where: { id: transaction.id } }
        );
      }
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();