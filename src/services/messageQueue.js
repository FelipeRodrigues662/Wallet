const amqp = require('amqplib');

class MessageQueue {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      this.channel = await this.connection.createChannel();
      
      // Define queues
      await this.channel.assertQueue('transaction_queue', { durable: true });
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  async publishTransaction(transaction) {
    try {
      await this.channel.sendToQueue(
        'transaction_queue',
        Buffer.from(JSON.stringify(transaction)),
        { persistent: true }
      );
    } catch (error) {
      console.error('Error publishing message:', error);
      throw error;
    }
  }

  async consumeTransactions(callback) {
    try {
      await this.channel.consume('transaction_queue', async (data) => {
        const transaction = JSON.parse(data.content);
        await callback(transaction);
        this.channel.ack(data);
      });
    } catch (error) {
      console.error('Error consuming message:', error);
      throw error;
    }
  }
}

module.exports = new MessageQueue();