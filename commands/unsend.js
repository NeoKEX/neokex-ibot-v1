import logger from '../utils/logger.js';
import config from '../config.js';

export default {
  config: {
    name: 'unsend',
    aliases: ['delete', 'remove', 'del'],
    description: 'Unsend a message (reply to the message you want to unsend)',
    usage: 'unsend\n\nReply to a message with this command to unsend it.',
    cooldown: 3,
    role: 0,
    author: 'NeoKEX'
  },

  async run({ api, event, bot }) {
    try {
      // Debug: Log event structure
      if (config.LOG_LEVEL === 'debug') {
        logger.debug('Unsend command event:', {
          hasReplyToItemId: !!event.replyToItemId,
          eventKeys: Object.keys(event)
        });
      }

      // Check if this is a reply to a message
      if (!event.replyToItemId) {
        // Provide more helpful error message
        const debugInfo = config.LOG_LEVEL === 'debug' 
          ? `\n\nDebug: Available fields: ${Object.keys(event).join(', ')}`
          : '';
        
        return api.sendMessage(
          '❌ Please reply to the message you want to unsend!\n\n' +
          'Usage: Reply to any message and type !unsend' +
          debugInfo,
          event.threadId
        );
      }

      const messageIdToUnsend = event.replyToItemId;

      // Try to unsend the message
      try {
        await bot.ig.dm.unsendMessage(event.threadId, messageIdToUnsend);
        
        logger.info(`Message unsent: ${messageIdToUnsend} in thread ${event.threadId}`);
        
        return api.sendMessage('✅ Message unsent successfully!', event.threadId);
      } catch (unsendError) {
        logger.error(`Failed to unsend message: ${unsendError.message}`);
        
        // Check for common error cases
        if (unsendError.message.includes('not found') || unsendError.message.includes('404')) {
          return api.sendMessage(
            '❌ Message not found! It may have already been deleted.',
            event.threadId
          );
        } else if (unsendError.message.includes('permission') || unsendError.message.includes('403')) {
          return api.sendMessage(
            '❌ Cannot unsend this message! You can only unsend messages sent by the bot.',
            event.threadId
          );
        } else {
          return api.sendMessage(
            `❌ Failed to unsend message: ${unsendError.message}`,
            event.threadId
          );
        }
      }
    } catch (error) {
      logger.error(`Error in unsend command: ${error.message}`);
      return api.sendMessage('Error executing unsend command.', event.threadId);
    }
  }
};
