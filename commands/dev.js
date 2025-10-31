module.exports = {
  config: {
    name: 'dev',
    aliases: ['developer', 'owner'],
    description: 'Developer panel - Bot developer only',
    usage: 'dev',
    cooldown: 0,
    role: 3,
    author: 'NeoKEX',
    category: 'system'
  },

  async run({ api, event, bot, logger, config }) {
    try {
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      
      const memoryUsage = process.memoryUsage();
      const heapUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const heapTotal = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      
      let devText = `╔═══════════════════════════════════╗\n`;
      devText += `║    DEVELOPER CONTROL PANEL        ║\n`;
      devText += `╚═══════════════════════════════════╝\n\n`;
      devText += `🔧 System Information:\n`;
      devText += `  • Node.js: ${process.version}\n`;
      devText += `  • Platform: ${process.platform}\n`;
      devText += `  • Architecture: ${process.arch}\n`;
      devText += `  • PID: ${process.pid}\n\n`;
      devText += `📊 Performance:\n`;
      devText += `  • Uptime: ${hours}h ${minutes}m ${seconds}s\n`;
      devText += `  • Memory: ${heapUsed}MB / ${heapTotal}MB\n`;
      devText += `  • Message Delivery: Instant\n\n`;
      devText += `⚙️ Bot Configuration:\n`;
      devText += `  • Name: ${config.BOT_NAME}\n`;
      devText += `  • Version: ${config.BOT_VERSION}\n`;
      devText += `  • Author: ${config.AUTHOR}\n`;
      devText += `  • Commands: ${bot.commandLoader.getAllCommandNames().length}\n`;
      devText += `  • Events: ${bot.eventLoader.getAllEventNames().length}\n\n`;
      devText += `👥 User Info:\n`;
      devText += `  • Bot User ID: ${bot.userID}\n`;
      devText += `  • Bot Username: ${bot.username}\n\n`;
      devText += `⚡ Status: All Systems Operational`;
      
      return api.sendMessage(devText, event.threadId);
    } catch (error) {
      logger.error('Error in dev command', { error: error.message, stack: error.stack });
      return api.sendMessage('Error displaying developer panel.', event.threadId);
    }
  }
};
