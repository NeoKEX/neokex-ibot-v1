const logger = require('../utils/logger');
const axios = require('axios');

module.exports = {
  config: {
    name: 'ai',
    aliases: ['gpt', 'ask', 'chatgpt'],
    description: 'Ask AI anything (requires OPENAI_API_KEY)',
    usage: 'ai <question>\n\nExamples:\n  ai What is the meaning of life?\n  ai Write a short poem about coding',
    cooldown: 10,
    role: 0,
    author: 'NeoKEX'
  },

  async run({ api, event, args }) {
    try {
      if (args.length === 0) {
        return api.sendMessage(
          '❌ Please provide a question!\n\n' +
          'Usage: ai <question>\n' +
          'Example: ai What is JavaScript?',
          event.threadId
        );
      }

      const question = args.join(' ');

      // Check if API key is configured
      if (!process.env.OPENAI_API_KEY) {
        return api.sendMessage(
          '❌ AI feature is not configured!\n\n' +
          'This command requires an OpenAI API key to be set in environment variables.\n' +
          'Please contact the bot administrator.',
          event.threadId
        );
      }

      await api.sendMessage('🤖 Thinking...', event.threadId);

      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant. Keep responses concise and under 500 characters when possible.'
              },
              {
                role: 'user',
                content: question
              }
            ],
            max_tokens: 500,
            temperature: 0.7
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            timeout: 30000
          }
        );

        const aiResponse = response.data.choices[0].message.content;
        const message = `🤖 AI Response:\n\n${aiResponse}`;

        return api.sendMessage(message, event.threadId);

      } catch (apiError) {
        logger.error('OpenAI API error', { error: apiError.message });
        
        if (apiError.response?.status === 401) {
          return api.sendMessage(
            '❌ Invalid API key. Please contact the bot administrator.',
            event.threadId
          );
        } else if (apiError.response?.status === 429) {
          return api.sendMessage(
            '❌ AI service rate limit exceeded. Please try again later.',
            event.threadId
          );
        } else {
          return api.sendMessage(
            `❌ Failed to get AI response: ${apiError.message}`,
            event.threadId
          );
        }
      }

    } catch (error) {
      logger.error('Error in ai command', { error: error.message, stack: error.stack });
      return api.sendMessage('Error executing AI command.', event.threadId);
    }
  }
};
