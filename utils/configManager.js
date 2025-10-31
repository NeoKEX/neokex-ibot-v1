import fs from 'fs';
import path from 'path';
import logger from './logger.js';

class ConfigManager {
  static configPath = './config.json';

  /**
   * Load config.json
   * @returns {Object} Configuration object
   */
  static loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf-8');
        return JSON.parse(configData);
      }
      return {};
    } catch (error) {
      logger.error('Error loading config.json:', { error: error.message });
      return {};
    }
  }

  /**
   * Save config.json
   * @param {Object} config - Configuration object to save
   * @returns {boolean} Success status
   */
  static saveConfig(config) {
    try {
      const configData = JSON.stringify(config, null, 2);
      fs.writeFileSync(this.configPath, configData, 'utf-8');
      logger.info('Configuration saved successfully');
      return true;
    } catch (error) {
      logger.error('Error saving config.json:', { error: error.message });
      return false;
    }
  }

  /**
   * Add admin to config
   * @param {string} userId - User ID to add as admin
   * @returns {boolean} Success status
   */
  static addAdmin(userId) {
    try {
      const config = this.loadConfig();
      
      if (!config.permissions) {
        config.permissions = { admins: [] };
      }
      
      if (!config.permissions.admins) {
        config.permissions.admins = [];
      }

      // Check if already admin
      if (config.permissions.admins.includes(userId)) {
        return false; // Already admin
      }

      config.permissions.admins.push(userId);
      return this.saveConfig(config);
    } catch (error) {
      logger.error('Error adding admin:', { error: error.message, userId });
      return false;
    }
  }

  /**
   * Remove admin from config
   * @param {string} userId - User ID to remove from admins
   * @returns {boolean} Success status
   */
  static removeAdmin(userId) {
    try {
      const config = this.loadConfig();
      
      if (!config.permissions || !config.permissions.admins) {
        return false;
      }

      // Check if user is admin
      const index = config.permissions.admins.indexOf(userId);
      if (index === -1) {
        return false; // Not an admin
      }

      // Don't allow removing developer
      if (userId === config.permissions.developer) {
        return false; // Cannot remove developer
      }

      config.permissions.admins.splice(index, 1);
      return this.saveConfig(config);
    } catch (error) {
      logger.error('Error removing admin:', { error: error.message, userId });
      return false;
    }
  }

  /**
   * Get list of admins
   * @returns {Array} Array of admin user IDs
   */
  static getAdmins() {
    try {
      const config = this.loadConfig();
      return config.permissions?.admins || [];
    } catch (error) {
      logger.error('Error getting admins:', { error: error.message });
      return [];
    }
  }

  /**
   * Check if user is admin
   * @param {string} userId - User ID to check
   * @returns {boolean} True if user is admin
   */
  static isAdmin(userId) {
    const admins = this.getAdmins();
    return admins.includes(userId);
  }

  /**
   * Get developer ID
   * @returns {string} Developer user ID
   */
  static getDeveloper() {
    try {
      const config = this.loadConfig();
      return config.permissions?.developer || '';
    } catch (error) {
      logger.error('Error getting developer:', { error: error.message });
      return '';
    }
  }
}

export default ConfigManager;
