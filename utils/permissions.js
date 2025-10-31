import config from '../config.js';
import ConfigManager from './configManager.js';
import logger from './logger.js';

/**
 * Role System:
 * 0 - All Users (anyone can use)
 * 1 - Bot Admins (defined in config.BOT_ADMINS)
 * 2 - Bot Admins (same as role 1 for Instagram)
 * 3 - Bot Developer (config.DEVELOPER_ID)
 * 
 * Note: Role 2 is equivalent to Role 1 for Instagram since
 * Instagram DMs don't have traditional group admin roles like Facebook
 */

class PermissionManager {
  /**
   * Check if user has required role
   * @param {string} userId - User ID
   * @param {number} requiredRole - Required role level (0-3)
   * @param {Object} threadInfo - Thread information (optional, for future use)
   * @returns {boolean} True if user has permission
   */
  static async hasPermission(userId, requiredRole = 0, threadInfo = null) {
    // Role 0: Everyone has access
    if (requiredRole === 0) {
      return true;
    }

    // Normalize userId to string for comparison
    const userIdStr = String(userId);

    // Get fresh config data from config.json
    const admins = ConfigManager.getAdmins();
    const developer = ConfigManager.getDeveloper();

    // Debug logging
    logger.debug('Permission check', {
      userId,
      userIdStr,
      requiredRole,
      admins,
      developer,
      isInAdmins: admins.includes(userIdStr),
      isDeveloper: userIdStr === developer
    });

    // Role 3: Bot Developer
    if (requiredRole === 3) {
      return userIdStr === developer;
    }

    // If user is developer, they have access to everything
    if (userIdStr === developer) {
      return true;
    }

    // Role 1 & 2: Bot Admins (Role 2 = Role 1 for Instagram)
    if (requiredRole === 1 || requiredRole === 2) {
      return admins.includes(userIdStr);
    }

    return false;
  }

  /**
   * Get role name
   * @param {number} role - Role number
   * @returns {string} Role name
   */
  static getRoleName(role) {
    const roles = {
      0: 'All Users',
      1: 'Bot Admin',
      2: 'Bot Admin',
      3: 'Bot Developer'
    };
    return roles[role] || 'Unknown';
  }

  /**
   * Get user's highest role
   * @param {string} userId - User ID
   * @param {Object} threadInfo - Thread information (optional, for future use)
   * @returns {number} Highest role number
   */
  static getUserRole(userId, threadInfo = null) {
    // Normalize userId to string for comparison
    const userIdStr = String(userId);

    // Get fresh config data from config.json
    const admins = ConfigManager.getAdmins();
    const developer = ConfigManager.getDeveloper();

    if (userIdStr === developer) {
      return 3;
    }

    if (admins.includes(userIdStr)) {
      return 1;
    }

    return 0;
  }
}

export default PermissionManager;
