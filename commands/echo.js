module.exports = {
  config: {
    name: 'echo',
    aliases: ['say', 'repeat'],
    description: 'Repeat your message',
    usage: 'echo <message>',
    cooldown: 3,
    role: 0,
    author: 'NeoKEX'
  },

  async run({ api, event, args }) {
    try {
      if (args.length === 0) {
        return api.sendMessage('Please provide a message to echo!', event.threadId);
      }
      
      const message = args.join(' ');
      return api.sendMessage(message, event.threadId);
    } catch (error) {

      return api.sendMessage('Error executing echo command.', event.threadId);
    }
  }
};
