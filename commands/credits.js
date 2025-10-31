const config = require('../config');

module.exports = {
  config: {
    name: 'credits',
    aliases: ['author', 'creator'],
    description: 'Show bot credits and author information',
    usage: 'credits',
    cooldown: 5,
    role: 0,
    author: 'NeoKEX'
  },

  async run({ api, event }) {
    try {
      let creditsText = `
╔═══════════════════════════════════════════════╗
║                                               ║
║        ${config.BOT_NAME}                       
║                                               ║
╚═══════════════════════════════════════════════╝

👤 Created by: ${config.AUTHOR}
📦 Version: ${config.BOT_VERSION}
🔗 GitHub: ${config.GITHUB}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💖 Special Thanks:
  • All supporters and contributors
  • Open source community
  • Instagram Bot developers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  COPYRIGHT NOTICE ⚠️

This bot was created by ${config.AUTHOR}.
Removing or modifying credits is strictly prohibited!

🚫 Violations will result in:
  ✗ Immediate ban from support
  ✗ Loss of future updates
  ✗ Public exposure of violation
  ✗ Possible legal action

✅ Please respect the creator's work!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌟 Like this bot? Star it on GitHub!
🐛 Found a bug? Report it on GitHub Issues
💡 Have suggestions? Open a GitHub Discussion

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
      
      return api.sendMessage(creditsText, event.threadId);
    } catch (error) {

      return api.sendMessage('Error displaying credits.', event.threadId);
    }
  }
};
