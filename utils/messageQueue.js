const logger = require('./logger');
const config = require('../config');

class MessageQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.lastMessageTime = 0;
  }

  /**
   * Add message to queue
   * @param {Function} sendFunction - Function to send the message
   * @param {Object} context - Message context
   */
  add(sendFunction, context = {}) {
    this.queue.push({ sendFunction, context, timestamp: Date.now() });
    logger.debug('Message added to queue', { queueLength: this.queue.length });
    
    if (!this.processing) {
      this.process();
    }
  }

  /**
   * Process message queue with rate limiting
   */
  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const { sendFunction, context } = this.queue.shift();
      
      // Rate limiting
      const now = Date.now();
      const timeSinceLastMessage = now - this.lastMessageTime;
      
      if (timeSinceLastMessage < config.MESSAGE_DELAY_MS) {
        const delay = config.MESSAGE_DELAY_MS - timeSinceLastMessage;
        logger.debug(`Rate limiting: waiting ${delay}ms`);
        await this.sleep(delay);
      }

      try {
        await sendFunction();
        this.lastMessageTime = Date.now();
        logger.debug('Message sent successfully', context);
      } catch (error) {
        logger.error('Failed to send message', { error: error.message, context });
      }
    }

    this.processing = false;
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get queue length
   * @returns {number} Number of messages in queue
   */
  getQueueLength() {
    return this.queue.length;
  }

  /**
   * Clear the queue
   */
  clear() {
    this.queue = [];
    logger.info('Message queue cleared');
  }
}

module.exports = MessageQueue;
