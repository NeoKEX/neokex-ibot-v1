import config from '../config.js';
import logger from '../utils/logger.js';
import PermissionManager from '../utils/permissions.js';
import Banner from '../utils/banner.js';

export default {
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

      logger.info('Received message', {
        from: event.senderID,
        threadId: event.threadId,
        message: event.body?.substring(0, 50)
      });

      Banner.messageReceived(event.senderID, event.body || '');

      // Check if message is a command
      if (event.body && event.body.startsWith(config.PREFIX)) {
        const args = event.body.slice(config.PREFIX.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        const command = commandLoader.getCommand(commandName);
        
        if (!command) {
          logger.debug(`Unknown command: ${commandName}`);
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
          logger.debug(`User ${event.senderID} on cooldown for ${command.config.name}`);
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
          logger.warn(`User ${event.senderID} lacks permission for ${command.config.name}`, {
            required: roleName
          });
          return api.sendMessage(
            `❌ Access Denied!\n\nThis command requires: ${roleName}\nYour role is not sufficient.`,
            event.threadId
          );
        }

        // Execute command
        try {
          logger.info(`Executing command: ${command.config.name}`, {
            user: event.senderID,
            args: args
          });

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
          logger.error(`Error executing command ${command.config.name}`, {
            error: error.message,
            stack: error.stack
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
