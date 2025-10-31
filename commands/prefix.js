module.exports = {
  config: {
    name: 'prefix',
    aliases: ['setprefix', 'changeprefix'],
    version: '1.0.0',
    author: 'NeoKEX',
    role: 0,
    cooldown: 5,
    category: 'config',
    description: 'Change the bot prefix for your chat or globally (admin only)',
    usage: 'prefix [new prefix] [-g] | prefix reset | prefix'
  },

  async run({ api, event, args, bot, logger, database, config, PermissionManager, ConfigManager }) {
    try {
      const currentPrefix = config.PREFIX;
      const threadId = event.threadId;
      const userId = event.senderID;

      // If no arguments, change prefix for the group (this is when they type !prefix without args)
      if (args.length === 0) {
        return api.sendMessage(
          `📌 PREFIX COMMAND\n\n` +
          `Usage:\n` +
          `  • ${currentPrefix}prefix <new> - Change prefix for this chat\n` +
          `  • ${currentPrefix}prefix reset - Reset to default\n` +
          `  • ${currentPrefix}prefix <new> -g - Change globally (admin only)\n\n` +
          `💡 Tip: Type just "prefix" (without ${currentPrefix}) to see current prefix info`,
          threadId
        );
      }

      // Handle reset
      if (args[0].toLowerCase() === 'reset') {
        database.setThreadData(threadId, { prefix: null });
        
        const message = `✅ PREFIX RESET\n\nYour chat prefix has been reset to default: ${currentPrefix}`;
        return api.sendMessage(message, threadId);
      }

      const newPrefix = args[0];
      const isGlobal = args[1] === '-g' || args[1] === '--global';

      // Validate new prefix
      if (newPrefix.length > 5) {
        return api.sendMessage('❌ Prefix must be 5 characters or less!', threadId);
      }

      if (newPrefix.includes(' ')) {
        return api.sendMessage('❌ Prefix cannot contain spaces!', threadId);
      }

      // Handle global prefix change (admin only)
      if (isGlobal) {
        const hasAdminPermission = await PermissionManager.hasPermission(userId, 2);
        
        if (!hasAdminPermission) {
          return api.sendMessage(
            '❌ ACCESS DENIED\n\nOnly bot administrators can change the global system prefix.',
            threadId
          );
        }

        // Update global config
        try {
          ConfigManager.updateConfig('PREFIX', newPrefix);
          
          const message = `✅ GLOBAL PREFIX CHANGED\n\n` +
            `New system prefix: ${newPrefix}\n` +
            `Changed by: ${userId}\n\n` +
            `⚠️ Note: This affects all users and groups using this bot.`;
          
          logger.info(`Global prefix changed to "${newPrefix}" by user ${userId}`);
          return api.sendMessage(message, threadId);
          
        } catch (error) {
          logger.error('Failed to update global prefix', { error: error.message });
          return api.sendMessage(
            '❌ Failed to update global prefix. Please try again.',
            threadId
          );
        }
      }

      // Handle thread-specific prefix change
      const threadData = database.getThreadData(threadId) || {};
      threadData.prefix = newPrefix;
      database.setThreadData(threadId, threadData);

      const message = `✅ PREFIX CHANGED\n\n` +
        `New prefix for this chat: ${newPrefix}\n` +
        `Global prefix: ${currentPrefix}\n\n` +
        `💡 Example: ${newPrefix}help`;

      logger.info(`Thread prefix changed to "${newPrefix}" for thread ${threadId}`);
      return api.sendMessage(message, threadId);

    } catch (error) {
      logger.error('Error in prefix command', { 
        error: error.message, 
        stack: error.stack 
      });
      return api.sendMessage('❌ Error executing prefix command.', event.threadId);
    }
  }
};
