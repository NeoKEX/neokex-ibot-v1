const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const config = require('../config');

class EventLoader {
  constructor(bot) {
    this.bot = bot;
    this.events = new Map();
  }

  /**
   * Load all events from events directory
   */
  loadEvents() {
    const eventsPath = path.resolve(config.EVENTS_PATH);
    
    if (!fs.existsSync(eventsPath)) {
      logger.warn('Events directory not found, creating it');
      fs.mkdirSync(eventsPath, { recursive: true });
      return;
    }

    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    
    logger.info(`Loading ${eventFiles.length} events...`);

    for (const file of eventFiles) {
      try {
        const filePath = path.join(eventsPath, file);
        delete require.cache[require.resolve(filePath)]; // Clear cache for reload
        const event = require(filePath);

        if (!event.config || !event.config.name) {
          logger.warn(`Event ${file} is missing config.name, skipping`);
          continue;
        }

        this.events.set(event.config.name, event);
        logger.info(`Loaded event: ${event.config.name}`);
      } catch (error) {
        logger.error(`Failed to load event ${file}`, { error: error.message });
      }
    }

    logger.info(`Successfully loaded ${this.events.size} events`);
  }

  /**
   * Register events with the bot
   */
  registerEvents() {
    this.events.forEach((event, eventName) => {
      if (typeof event.run === 'function') {
        logger.debug(`Registering event handler: ${eventName}`);
      }
    });
  }

  /**
   * Handle event
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   */
  async handleEvent(eventName, data) {
    const event = this.events.get(eventName);
    
    if (!event) {
      logger.debug(`No handler for event: ${eventName}`);
      return;
    }

    try {
      await event.run(this.bot, data);
    } catch (error) {
      logger.error(`Error handling event ${eventName}`, {
        error: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Get all event names
   * @returns {Array} Array of event names
   */
  getAllEventNames() {
    return Array.from(this.events.keys());
  }
}

module.exports = EventLoader;
