export default {
  config: {
    name: 'coinflip',
    aliases: ['flip', 'coin', 'toss'],
    description: 'Flip a coin (Heads or Tails)',
    usage: 'coinflip',
    cooldown: 2,
    role: 0,
    author: 'NeoKEX'
  },

  async run({ api, event }) {
    try {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      const emoji = result === 'Heads' ? '🪙' : '💰';

      const message = `${emoji} Coin Flip Result:\n\n${result}!`;

      return api.sendMessage(message, event.threadId);
    } catch (error) {

      return api.sendMessage('Error flipping coin.', event.threadId);
    }
  }
};
