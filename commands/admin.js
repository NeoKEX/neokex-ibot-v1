import config from '../config.js';
import PermissionManager from '../utils/permissions.js';

export default {
  config: {
    name: 'admin',
    aliases: ['botadmin'],
    description: 'Admin panel - View bot admin information',
    usage: 'admin',
    cooldown: 5,
    role: 1,
    author: 'NeoKEX'
  },

  async run({ api, event, bot }) {
    try {
      const userRole = PermissionManager.getUserRole(event.senderID);
      const roleName = PermissionManager.getRoleName(userRole);
      
      let adminText = `╔════════════════════════════╗\n`;
      adminText += `║     ADMIN PANEL            ║\n`;
      adminText += `╚════════════════════════════╝\n\n`;
      adminText += `👤 Your Role: ${roleName}\n`;
      adminText += `🔢 Role Level: ${userRole}\n\n`;
      adminText += `📊 Bot Statistics:\n`;
      adminText += `  • Commands: ${bot.commandLoader.getAllCommandNames().length}\n`;
      adminText += `  • Events: ${bot.eventLoader.getAllEventNames().length}\n`;
      adminText += `  • Queue: ${bot.messageQueue.getQueueLength()} messages\n\n`;
      adminText += `🔐 Role System:\n`;
      adminText += `  0 - All Users\n`;
      adminText += `  1 - Bot Admins\n`;
      adminText += `  2 - Group Admins\n`;
      adminText += `  3 - Bot Developer\n\n`;
      adminText += `⚙️ Configuration:\n`;
      adminText += `  • Prefix: ${config.PREFIX}\n`;
      adminText += `  • Bot: ${config.BOT_NAME}\n`;
      adminText += `  • Author: ${config.AUTHOR}\n\n`;
      adminText += `⚠️ WARNING: Do NOT remove credits!`;
      
      return api.sendMessage(adminText, event.threadId);
    } catch (error) {
      console.error('Error in admin command:', error);
      return api.sendMessage('Error displaying admin panel.', event.threadId);
    }
  }
};
