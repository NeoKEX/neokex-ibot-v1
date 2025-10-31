module.exports = {
  config: {
    name: 'coinflip',
    aliases: ['flip', 'coin', 'toss'],
    description: 'Flip a coin (Heads or Tails)',
    usage: 'coinflip',
    cooldown: 2,
    role: 0,
    author: 'NeoKEX',
    category: 'game'
  },

  async run({ api, event, logger }) {
    try {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      const emoji = result === 'Heads' ? '🪙' : '💰';

      const message = `${emoji} Coin Flip Result:\n\n${result}!`;

      return api.sendMessage(message, event.threadId);
    } catch (error) {
      logger.error('Error in coinflip command', { error: error.message, stack: error.stack });
      return api.sendMessage('Error flipping coin.', event.threadId);
    }
  }
};
