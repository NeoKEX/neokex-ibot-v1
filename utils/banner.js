const logger = require('./logger');
const config = require('../config');

class Banner {
  static display() {
    const banner = `
╔═══════════════════════════════════════════════════════════════════╗
║                    NEOKEX INSTAGRAM BOT V1                        ║
╚═══════════════════════════════════════════════════════════════════╝
║  📦 Version: ${config.BOT_VERSION.padEnd(52)} ║
║  👤 Author:  ${config.AUTHOR.padEnd(52)} ║
║  🔗 GitHub:  ${config.GITHUB.padEnd(52)} ║
╚═══════════════════════════════════════════════════════════════════╝
`;
    console.log('\x1b[36m%s\x1b[0m', banner);
  }

  static startupMessage(userID, username, commandCount, eventCount) {
    console.log('');
    logger.success(`Bot started successfully`);
    logger.info(`User: @${username || 'Loading...'} (${userID || 'Loading...'})`);
    logger.info(`Loaded ${commandCount} commands and ${eventCount} events`);
    logger.info(`Prefix: ${config.PREFIX}`);
    logger.success(`Bot is now listening for messages...`);
    console.log('');
  }

  static commandExecuted(commandName, user, success = true) {
    logger.command(commandName, user, success);
  }

  static messageReceived(from, preview) {
    // Reduced logging for message events - only log in debug mode
    if (config.LOG_LEVEL === 'debug') {
      let previewStr = '';
      try {
        if (typeof preview === 'string') {
          previewStr = preview;
        } else if (preview === null || preview === undefined) {
          previewStr = '';
        } else if (typeof preview === 'object') {
          previewStr = JSON.stringify(preview);
        } else {
          previewStr = String(preview);
        }
      } catch (err) {
        previewStr = '[unable to display]';
      }
      const truncated = previewStr.length > 40 ? previewStr.substring(0, 40) + '...' : previewStr;
      logger.debug(`Message from ${from}: ${truncated}`);
    }
  }

  static error(context, error) {
    logger.error(`${context}: ${error}`);
  }

  static info(message) {
    logger.info(message);
  }

  static warning(message) {
    logger.warn(message);
  }

  static success(message) {
    logger.success(message);
  }
}

module.exports = Banner;
