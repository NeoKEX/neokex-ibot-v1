module.exports = {
  config: {
    name: 'calc',
    aliases: ['calculate', 'math'],
    description: 'Calculate mathematical expressions',
    usage: 'calc <expression>',
    cooldown: 3,
    role: 0,
    author: 'NeoKEX',
    category: 'utility'
  },

  async run({ api, event, args, logger }) {
    try {
      if (args.length === 0) {
        return api.sendMessage(
          '❌ Please provide a mathematical expression!\n\n' +
          'Examples:\n' +
          '• calc 2 + 2\n' +
          '• calc 10 * 5\n' +
          '• calc (100 - 25) / 5',
          event.threadId
        );
      }

      const expression = args.join(' ');

      if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
        return api.sendMessage(
          '❌ Invalid expression! Only use numbers and operators (+, -, *, /, ())',
          event.threadId
        );
      }

      try {
        const result = this.safeEval(expression);

        if (!isFinite(result)) {
          return api.sendMessage('❌ Result is not a valid number!', event.threadId);
        }

        const message = `🧮 Calculator\n\nExpression: ${expression}\nResult: ${result}`;

        return api.sendMessage(message, event.threadId);
      } catch (evalError) {
        return api.sendMessage(
          '❌ Invalid mathematical expression!\n\nPlease check your syntax.',
          event.threadId
        );
      }
    } catch (error) {
      logger.error('Error in calc command', { error: error.message, stack: error.stack });
      return api.sendMessage('Error executing calculation.', event.threadId);
    }
  },

  safeEval(expr) {
    const sanitized = expr.replace(/[^0-9+\-*/().\s]/g, '');
    return Function('"use strict"; return (' + sanitized + ')')();
  }
};
