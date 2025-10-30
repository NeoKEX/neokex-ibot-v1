import logger from '../utils/logger.js';

export default {
  config: {
    name: 'error',
    description: 'Handle bot errors'
  },

  async run(bot, error) {
    logger.error('Bot error occurred', {
      error: error.message,
      stack: error.stack,
      code: error.code
    });

    // Auto-reconnect logic
    if (bot.shouldReconnect) {
      logger.info('Attempting to reconnect...');
      setTimeout(() => {
        if (bot.reconnect && typeof bot.reconnect === 'function') {
          bot.reconnect();
        }
      }, 5000);
    }
  }
};
