import config from '../config.js';

export default {
  config: {
    name: 'info',
    aliases: ['about', 'botinfo'],
    description: 'Show bot information',
    usage: 'info',
    cooldown: 5
  },

  async run({ api, event, bot }) {
    try {
      const { commandLoader } = bot;
      const totalCommands = commandLoader.getAllCommandNames().length;
      
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      
      const memoryUsage = process.memoryUsage();
      const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      
      let infoText = `ℹ️ ${config.BOT_NAME} Information\n\n`;
      infoText += `Version: 1.0.0\n`;
      infoText += `Prefix: ${config.PREFIX}\n`;
      infoText += `Commands: ${totalCommands}\n`;
      infoText += `Uptime: ${hours}h ${minutes}m ${seconds}s\n`;
      infoText += `Memory: ${memoryMB}MB\n`;
      infoText += `Node.js: ${process.version}\n`;
      infoText += `Platform: ${process.platform}\n`;
      infoText += `\nStatus: ✅ Fully Operational`;
      
      return api.sendMessage(infoText, event.threadId);
    } catch (error) {
      console.error('Error in info command:', error);
      return api.sendMessage('Error displaying bot information.', event.threadId);
    }
  }
};
