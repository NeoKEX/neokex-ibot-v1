import logger from '../utils/logger.js';
import Banner from '../utils/banner.js';

export default {
  config: {
    name: 'ready',
    description: 'Bot is ready and connected'
  },

  async run(bot, data) {
    logger.info('Bot is ready and connected!', {
      userID: bot.userID,
      username: bot.username
    });
    
    Banner.startupMessage(
      bot.userID,
      bot.username,
      bot.commandLoader.getAllCommandNames().length,
      bot.eventLoader.getAllEventNames().length
    );
  }
};
