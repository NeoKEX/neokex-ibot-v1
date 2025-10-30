import logger from '../utils/logger.js';

export default {
  config: {
    name: 'ready',
    description: 'Bot is ready and connected'
  },

  async run(bot, data) {
    logger.info('🤖 Bot is ready and connected!', {
      userID: bot.userID,
      username: bot.username
    });
    
    console.log('\n=================================');
    console.log('✅ Instagram Bot Started Successfully');
    console.log('=================================');
    console.log(`User ID: ${bot.userID}`);
    console.log(`Username: ${bot.username || 'N/A'}`);
    console.log(`Commands Loaded: ${bot.commandLoader.getAllCommandNames().length}`);
    console.log(`Events Loaded: ${bot.eventLoader.getAllEventNames().length}`);
    console.log('=================================\n');
  }
};
