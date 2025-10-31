const config = require('../config');
const logger = require('../utils/logger');
const PermissionManager = require('../utils/permissions');
const Banner = require('../utils/banner');

module.exports = {
  config: {
    name: 'message',
    description: 'Handle incoming messages'
  },

  async run(bot, data) {
    try {
      const { api, commandLoader, messageQueue } = bot;
      const event = data;

      // Ignore messages from self
      if (event.senderID === bot.userID) {
        return;
      }

      // Log message only in debug mode
      Banner.messageReceived(event.senderID, event.body || '');

      // Check if message is a command
      if (event.body && event.body.startsWith(config.PREFIX)) {
        const args = event.body.slice(config.PREFIX.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        const command = commandLoader.getCommand(commandName);
        
        if (!command) {
          return;
        }

        // Check cooldown
        const cooldownTime = (command.config.cooldown || 0) * 1000;
        const remainingCooldown = commandLoader.checkCooldown(
          event.senderID,
          command.config.name,
          cooldownTime
        );

        if (remainingCooldown > 0) {
          return api.sendMessage(
            `⏰ Please wait ${remainingCooldown}s before using this command again.`,
            event.threadId
          );
        }

        // Check permissions
        const requiredRole = command.config.role || 0;
        const hasPermission = await PermissionManager.hasPermission(event.senderID, requiredRole);

        if (!hasPermission) {
          const roleName = PermissionManager.getRoleName(requiredRole);
          return api.sendMessage(
            `❌ Access Denied!\n\nThis command requires: ${roleName}\nYour role is not sufficient.`,
            event.threadId
          );
        }

        // Execute command
        try {
          Banner.commandExecuted(command.config.name, event.senderID, true);

          await command.run({
            api,
            event,
            args,
            bot,
            commandName: command.config.name
          });

          // Set cooldown
          if (cooldownTime > 0) {
            commandLoader.setCooldown(event.senderID, command.config.name, cooldownTime);
          }
        } catch (error) {
          logger.error(`Command error: ${command.config.name}`, {
            error: error.message
          });
          
          Banner.commandExecuted(command.config.name, event.senderID, false);
          
          api.sendMessage(
            `❌ Error executing command: ${error.message}`,
            event.threadId
          );
        }
      }
    } catch (error) {
      logger.error('Error in message event handler', {
        error: error.message,
        stack: error.stack
      });
    }
  }
};
