const config = require('../config');
const logger = require('../utils/logger');
const PermissionManager = require('../utils/permissions');
const Banner = require('../utils/banner');
const database = require('../utils/database');
const moderation = require('../utils/moderation');

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

      // Track user activity
      const user = database.getUser(event.senderID);
      user.messageCount++;
      database.updateUser(event.senderID, user);

      // Moderation checks
      const moderationResult = await moderation.moderateMessage(event.senderID, event.body);
      if (!moderationResult.allowed) {
        logger.info(`Message blocked from ${event.senderID}: ${moderationResult.reason}`);
        if (moderationResult.message && moderationResult.reason !== 'whitelist') {
          await api.sendMessage(moderationResult.message, event.threadId);
        }
        return;
      }

      // Send welcome message to new users
      if (config.WELCOME_MESSAGE_ENABLED && !database.hasBeenWelcomed(event.senderID)) {
        await api.sendMessage(config.WELCOME_MESSAGE, event.threadId);
        database.markAsWelcomed(event.senderID);
        logger.info(`Sent welcome message to user ${event.senderID}`);
      }

      // Log message only in debug mode
      Banner.messageReceived(event.senderID, event.body || '');

      // Check for auto-responses (before command check)
      if (event.body) {
        const autoResponse = database.findAutoResponse(event.body);
        if (autoResponse) {
          await api.sendMessage(autoResponse.response, event.threadId);
          return;
        }
      }

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

          // Show typing indicator if enabled
          if (config.TYPING_INDICATOR) {
            try {
              await bot.ig.dm.markAsTyping(event.threadId);
            } catch (typingError) {
              logger.debug('Could not send typing indicator', { error: typingError.message });
            }
          }

          // Track command usage
          user.commandCount++;
          database.updateUser(event.senderID, user);
          database.incrementStat('totalCommands');

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
