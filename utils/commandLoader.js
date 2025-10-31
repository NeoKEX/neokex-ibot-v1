const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const config = require('../config');

class CommandLoader {
  constructor() {
    this.commands = new Map();
    this.cooldowns = new Map();
  }

  /**
   * Load all commands from commands directory
   */
  async loadCommands() {
    const commandsPath = path.resolve(__dirname, '..', config.COMMANDS_PATH);
    
    if (!fs.existsSync(commandsPath)) {
      logger.warn('Commands directory not found, creating it');
      fs.mkdirSync(commandsPath, { recursive: true });
      return;
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    logger.info(`Loading ${commandFiles.length} commands...`);

    for (const file of commandFiles) {
      try {
        const filePath = path.join(commandsPath, file);
        // Clear require cache for hot reload
        delete require.cache[require.resolve(filePath)];
        const commandModule = require(filePath);

        if (!commandModule.config || !commandModule.config.name) {
          logger.warn(`Command ${file} is missing config.name, skipping`);
          continue;
        }

        this.commands.set(commandModule.config.name, commandModule);
        
        if (commandModule.config.aliases) {
          commandModule.config.aliases.forEach(alias => {
            this.commands.set(alias, commandModule);
          });
        }

        logger.info(`Loaded command: ${commandModule.config.name}`, {
          description: commandModule.config.description,
          aliases: commandModule.config.aliases || []
        });
      } catch (error) {
        logger.error(`Failed to load command ${file}`, { error: error.message });
      }
    }

    logger.info(`Successfully loaded ${this.commands.size} commands`);
  }

  /**
   * Get command by name or alias
   * @param {string} commandName - Command name or alias
   * @returns {Object|null} Command object or null
   */
  getCommand(commandName) {
    return this.commands.get(commandName.toLowerCase()) || null;
  }

  /**
   * Check if user is on cooldown
   * @param {string} userId - User ID
   * @param {string} commandName - Command name
   * @param {number} cooldownTime - Cooldown time in ms
   * @returns {number} Remaining cooldown time (0 if not on cooldown)
   */
  checkCooldown(userId, commandName, cooldownTime) {
    const key = `${userId}-${commandName}`;
    
    if (!this.cooldowns.has(key)) {
      return 0;
    }

    const expirationTime = this.cooldowns.get(key);
    const now = Date.now();

    if (now < expirationTime) {
      return Math.ceil((expirationTime - now) / 1000);
    }

    this.cooldowns.delete(key);
    return 0;
  }

  /**
   * Set cooldown for user
   * @param {string} userId - User ID
   * @param {string} commandName - Command name
   * @param {number} cooldownTime - Cooldown time in ms
   */
  setCooldown(userId, commandName, cooldownTime) {
    const key = `${userId}-${commandName}`;
    const expirationTime = Date.now() + cooldownTime;
    this.cooldowns.set(key, expirationTime);

    setTimeout(() => {
      this.cooldowns.delete(key);
    }, cooldownTime);
  }

  /**
   * Reload all commands
   */
  async reloadCommands() {
    logger.info('Reloading all commands...');
    this.commands.clear();
    await this.loadCommands();
  }

  /**
   * Get all command names
   * @returns {Array} Array of command names
   */
  getAllCommandNames() {
    const uniqueCommands = new Set();
    this.commands.forEach((command) => {
      uniqueCommands.add(command.config.name);
    });
    return Array.from(uniqueCommands);
  }
}

module.exports = CommandLoader;
