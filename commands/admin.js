import config from '../config.js';
import PermissionManager from '../utils/permissions.js';
import ConfigManager from '../utils/configManager.js';

export default {
  config: {
    name: 'admin',
    aliases: ['botadmin', 'admins'],
    description: 'Admin panel - Manage bot administrators',
    usage: 'admin [add|remove|list] [user_id]\n\nExamples:\n  admin - View admin panel\n  admin list - List all admins\n  admin add 123456789 - Add admin\n  admin remove 123456789 - Remove admin',
    cooldown: 5,
    role: 1,
    author: 'NeoKEX'
  },

  async run({ api, event, args, bot }) {
    try {
      const senderRole = PermissionManager.getUserRole(event.senderID);
      const isDeveloper = event.senderID === config.DEVELOPER_ID;
      const isAdmin = config.BOT_ADMINS.includes(event.senderID);

      // No arguments - Show admin panel
      if (args.length === 0) {
        return this.showAdminPanel(api, event, bot, senderRole);
      }

      const action = args[0].toLowerCase();

      // List admins
      if (action === 'list' || action === 'show') {
        return this.listAdmins(api, event);
      }

      // Add admin (requires admin or developer role)
      if (action === 'add') {
        if (!isAdmin && !isDeveloper) {
          return api.sendMessage('❌ Only admins can add other admins.', event.threadId);
        }

        if (args.length < 2) {
          return api.sendMessage('❌ Please provide a User ID to add.\n\nUsage: admin add <user_id>', event.threadId);
        }

        const userIdToAdd = args[1];
        return this.addAdmin(api, event, userIdToAdd, bot);
      }

      // Remove admin (requires developer role only for safety)
      if (action === 'remove' || action === 'delete') {
        if (!isDeveloper) {
          return api.sendMessage('🔒 Only the developer can remove admins.', event.threadId);
        }

        if (args.length < 2) {
          return api.sendMessage('❌ Please provide a User ID to remove.\n\nUsage: admin remove <user_id>', event.threadId);
        }

        const userIdToRemove = args[1];
        return this.removeAdmin(api, event, userIdToRemove, bot);
      }

      // Invalid action
      return api.sendMessage(
        '❌ Invalid action!\n\n' +
        'Available actions:\n' +
        '• admin - View admin panel\n' +
        '• admin list - List all admins\n' +
        '• admin add <user_id> - Add admin\n' +
        '• admin remove <user_id> - Remove admin',
        event.threadId
      );

    } catch (error) {
      console.error('Error in admin command:', error);
      return api.sendMessage('❌ Error executing admin command.', event.threadId);
    }
  },

  async showAdminPanel(api, event, bot, senderRole) {
    const roleName = PermissionManager.getRoleName(senderRole);
    const admins = ConfigManager.getAdmins();
    const developer = ConfigManager.getDeveloper();

    let adminText = `╔════════════════════════════╗\n`;
    adminText += `║     ADMIN PANEL            ║\n`;
    adminText += `╚════════════════════════════╝\n\n`;
    adminText += `👤 Your Role: ${roleName}\n`;
    adminText += `🔢 Role Level: ${senderRole}\n\n`;
    
    adminText += `👥 Administrators:\n`;
    adminText += `  • Developer: ${developer || 'Not set'}\n`;
    adminText += `  • Admins: ${admins.length} total\n\n`;
    
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
    
    adminText += `📝 Commands:\n`;
    adminText += `  • admin list - List all admins\n`;
    adminText += `  • admin add <uid> - Add admin\n`;
    adminText += `  • admin remove <uid> - Remove admin\n\n`;
    
    adminText += `⚠️ WARNING: Do NOT remove credits!`;
    
    return api.sendMessage(adminText, event.threadId);
  },

  async listAdmins(api, event) {
    const admins = ConfigManager.getAdmins();
    const developer = ConfigManager.getDeveloper();

    let message = `👥 Bot Administrators\n\n`;
    message += `👨‍💻 Developer:\n`;
    message += `  • ${developer || 'Not set'}\n\n`;
    
    if (admins.length === 0) {
      message += `🔒 Admins:\n  • No admins configured\n\n`;
    } else {
      message += `🔒 Admins (${admins.length}):\n`;
      admins.forEach((adminId, index) => {
        message += `  ${index + 1}. ${adminId}\n`;
      });
      message += `\n`;
    }

    message += `💡 Use 'admin add <uid>' to add admins\n`;
    message += `💡 Use 'admin remove <uid>' to remove admins`;

    return api.sendMessage(message, event.threadId);
  },

  async addAdmin(api, event, userIdToAdd, bot) {
    // Check if already admin
    if (ConfigManager.isAdmin(userIdToAdd)) {
      return api.sendMessage(`❌ User ${userIdToAdd} is already an admin!`, event.threadId);
    }

    // Check if trying to add developer
    if (userIdToAdd === ConfigManager.getDeveloper()) {
      return api.sendMessage(`ℹ️ User ${userIdToAdd} is the developer (already has highest permissions).`, event.threadId);
    }

    // Validate user ID (basic check)
    if (!/^\d+$/.test(userIdToAdd)) {
      return api.sendMessage('❌ Invalid User ID format. Please provide a numeric User ID.', event.threadId);
    }

    // Get user info to verify user exists
    await api.sendMessage(`🔍 Verifying user ${userIdToAdd}...`, event.threadId);

    try {
      const userInfo = await bot.ig.getUserInfo(userIdToAdd);
      
      if (!userInfo) {
        return api.sendMessage(`❌ Could not find user with ID: ${userIdToAdd}`, event.threadId);
      }

      const username = userInfo.username || 'Unknown';
      const fullName = userInfo.full_name || 'N/A';

      // Add admin to config
      const success = ConfigManager.addAdmin(userIdToAdd);

      if (success) {
        // Reload config in memory
        const newConfig = ConfigManager.loadConfig();
        config.BOT_ADMINS = newConfig.permissions?.admins || [];

        let message = `✅ Admin Added Successfully!\n\n`;
        message += `👤 User Information:\n`;
        message += `  • Username: @${username}\n`;
        message += `  • Full Name: ${fullName}\n`;
        message += `  • User ID: ${userIdToAdd}\n\n`;
        message += `🔒 This user now has admin privileges!\n`;
        message += `📊 Total admins: ${config.BOT_ADMINS.length}`;

        return api.sendMessage(message, event.threadId);
      } else {
        return api.sendMessage('❌ Failed to add admin. Please try again.', event.threadId);
      }

    } catch (error) {
      console.error('Error verifying user:', error);
      
      // Still add them even if verification fails
      const success = ConfigManager.addAdmin(userIdToAdd);

      if (success) {
        // Reload config in memory
        const newConfig = ConfigManager.loadConfig();
        config.BOT_ADMINS = newConfig.permissions?.admins || [];

        let message = `✅ Admin Added Successfully!\n\n`;
        message += `🆔 User ID: ${userIdToAdd}\n`;
        message += `⚠️ Could not verify user details\n\n`;
        message += `🔒 This user now has admin privileges!\n`;
        message += `📊 Total admins: ${config.BOT_ADMINS.length}`;

        return api.sendMessage(message, event.threadId);
      } else {
        return api.sendMessage('❌ Failed to add admin.', event.threadId);
      }
    }
  },

  async removeAdmin(api, event, userIdToRemove, bot) {
    // Check if user is admin
    if (!ConfigManager.isAdmin(userIdToRemove)) {
      return api.sendMessage(`❌ User ${userIdToRemove} is not an admin!`, event.threadId);
    }

    // Check if trying to remove developer
    if (userIdToRemove === ConfigManager.getDeveloper()) {
      return api.sendMessage('❌ Cannot remove the developer!', event.threadId);
    }

    // Remove admin from config
    const success = ConfigManager.removeAdmin(userIdToRemove);

    if (success) {
      // Reload config in memory
      const newConfig = ConfigManager.loadConfig();
      config.BOT_ADMINS = newConfig.permissions?.admins || [];

      let message = `✅ Admin Removed Successfully!\n\n`;
      message += `🆔 User ID: ${userIdToRemove}\n`;
      message += `🔓 Admin privileges revoked\n`;
      message += `📊 Remaining admins: ${config.BOT_ADMINS.length}`;

      return api.sendMessage(message, event.threadId);
    } else {
      return api.sendMessage('❌ Failed to remove admin. Please try again.', event.threadId);
    }
  }
};
