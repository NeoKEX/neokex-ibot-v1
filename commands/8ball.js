module.exports = {
  config: {
    name: '8ball',
    aliases: ['magic8ball', 'eightball', 'fortune'],
    description: 'Ask the magic 8-ball a yes/no question',
    usage: '8ball <question>\n\nExamples:\n  8ball Will it rain today?\n  8ball Should I study programming?',
    cooldown: 3,
    role: 0,
    author: 'NeoKEX'
  },

  async run({ api, event, args, logger }) {
    try {
      if (args.length === 0) {
        return api.sendMessage(
          '🎱 Please ask me a yes/no question!\n\n' +
          'Usage: 8ball <question>\n' +
          'Example: 8ball Will I be successful?',
          event.threadId
        );
      }

      const responses = [
        // Positive responses
        'It is certain.',
        'It is decidedly so.',
        'Without a doubt.',
        'Yes - definitely.',
        'You may rely on it.',
        'As I see it, yes.',
        'Most likely.',
        'Outlook good.',
        'Yes.',
        'Signs point to yes.',
        
        // Non-committal responses
        'Reply hazy, try again.',
        'Ask again later.',
        'Better not tell you now.',
        'Cannot predict now.',
        'Concentrate and ask again.',
        
        // Negative responses
        "Don't count on it.",
        'My reply is no.',
        'My sources say no.',
        'Outlook not so good.',
        'Very doubtful.'
      ];

      const question = args.join(' ');
      const answer = responses[Math.floor(Math.random() * responses.length)];

      const message = `🎱 Magic 8-Ball\n\n` +
        `Question: ${question}\n\n` +
        `Answer: ${answer}`;

      return api.sendMessage(message, event.threadId);

    } catch (error) {
      logger.error('Error in 8ball command', { error: error.message, stack: error.stack });
      return api.sendMessage('Error consulting the magic 8-ball.', event.threadId);
    }
  }
};
