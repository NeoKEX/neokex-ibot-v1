module.exports = {
  config: {
    name: 'dice',
    aliases: ['roll', 'd6', 'rolldice'],
    description: 'Roll a dice (1-6) or custom sided dice',
    usage: 'dice [sides]\n\nExamples:\n  dice - Roll standard 6-sided dice\n  dice 20 - Roll 20-sided dice\n  dice 100 - Roll 100-sided dice',
    cooldown: 2,
    role: 0,
    author: 'NeoKEX'
  },

  async run({ api, event, args, logger }) {
    try {
      let sides = 6;

      if (args.length > 0) {
        const parsedSides = parseInt(args[0]);
        if (isNaN(parsedSides) || parsedSides < 2 || parsedSides > 1000) {
          return api.sendMessage(
            '❌ Invalid number of sides! Please use a number between 2 and 1000.',
            event.threadId
          );
        }
        sides = parsedSides;
      }

      const result = Math.floor(Math.random() * sides) + 1;

      const message = `🎲 Dice Roll (d${sides}):\n\nYou rolled: ${result}`;

      return api.sendMessage(message, event.threadId);
    } catch (error) {
      logger.error('Error in dice command', { error: error.message, stack: error.stack });
      return api.sendMessage('Error rolling dice.', event.threadId);
    }
  }
};
