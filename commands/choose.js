module.exports = {
  config: {
    name: 'choose',
    aliases: ['pick', 'select', 'random'],
    description: 'Randomly choose from given options',
    usage: 'choose <option1> | <option2> | <option3>...\n\nExamples:\n  choose pizza | burger | pasta\n  choose yes | no\n  choose red | blue | green | yellow',
    cooldown: 3,
    role: 0,
    author: 'NeoKEX'
  },

  async run({ api, event, args }) {
    try {
      if (args.length === 0) {
        return api.sendMessage(
          '❌ Please provide options to choose from!\n\n' +
          'Usage: choose <option1> | <option2> | <option3>\n\n' +
          'Example: choose pizza | burger | pasta',
          event.threadId
        );
      }

      const input = args.join(' ');
      const options = input.split('|').map(opt => opt.trim()).filter(opt => opt.length > 0);

      if (options.length < 2) {
        return api.sendMessage(
          '❌ Please provide at least 2 options separated by |\n\n' +
          'Example: choose pizza | burger | pasta',
          event.threadId
        );
      }

      const chosen = options[Math.floor(Math.random() * options.length)];

      const message = `🎯 Random Choice:\n\n` +
        `Options: ${options.join(', ')}\n\n` +
        `I choose: ${chosen}`;

      return api.sendMessage(message, event.threadId);
    } catch (error) {

      return api.sendMessage('Error making choice.', event.threadId);
    }
  }
};
