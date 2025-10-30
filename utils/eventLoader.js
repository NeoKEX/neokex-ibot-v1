import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EventLoader {
  constructor(bot) {
    this.bot = bot;
    this.events = new Map();
  }

  /**
   * Load all events from events directory
   */
  async loadEvents() {
    const eventsPath = path.resolve(__dirname, '..', config.EVENTS_PATH);
    
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
        const fileUrl = `file://${filePath}`;
        const event = await import(fileUrl + `?update=${Date.now()}`);
        const eventModule = event.default;

        if (!eventModule.config || !eventModule.config.name) {
          logger.warn(`Event ${file} is missing config.name, skipping`);
          continue;
        }

        this.events.set(eventModule.config.name, eventModule);
        logger.info(`Loaded event: ${eventModule.config.name}`);
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

export default EventLoader;
