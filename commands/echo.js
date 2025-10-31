module.exports = {
  config: {
    name: 'echo',
    aliases: ['say', 'repeat'],
    description: 'Repeat your message',
    usage: 'echo <message>',
    cooldown: 3,
    role: 0,
    author: 'NeoKEX',
    category: 'utility'
  },

  async run({ api, event, args, logger }) {
    try {
      if (args.length === 0) {
        return api.sendMessage('Please provide a message to echo!', event.threadId);
      }
      
      const message = args.join(' ');
      return api.sendMessage(message, event.threadId);
    } catch (error) {
      logger.error('Error in echo command', { error: error.message, stack: error.stack });
      return api.sendMessage('Error executing echo command.', event.threadId);
    }
  }
};
