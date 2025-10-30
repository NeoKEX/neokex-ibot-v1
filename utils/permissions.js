import config from '../config.js';
import logger from './logger.js';

/**
 * Role System:
 * 0 - All Users (anyone can use)
 * 1 - Bot Admins (defined in config.BOT_ADMINS)
 * 2 - Group Admins (thread administrators)
 * 3 - Bot Developer (config.DEVELOPER_ID)
 */

class PermissionManager {
  /**
   * Check if user has required role
   * @param {string} userId - User ID
   * @param {number} requiredRole - Required role level (0-3)
   * @param {Object} threadInfo - Thread information (optional, for group admin check)
   * @returns {boolean} True if user has permission
   */
  static async hasPermission(userId, requiredRole = 0, threadInfo = null) {
    // Role 0: Everyone has access
    if (requiredRole === 0) {
      return true;
    }

    // Role 3: Bot Developer
    if (requiredRole === 3) {
      return userId === config.DEVELOPER_ID;
    }

    // If user is developer, they have access to everything
    if (userId === config.DEVELOPER_ID) {
      return true;
    }

    // Role 1: Bot Admins
    if (requiredRole === 1) {
      return config.BOT_ADMINS.includes(userId);
    }

    // Role 2: Group Admins
    if (requiredRole === 2) {
      // Check if user is bot admin first (bot admins have group admin rights)
      if (config.BOT_ADMINS.includes(userId)) {
        return true;
      }

      // Check thread admin status
      if (threadInfo && threadInfo.admins) {
        return threadInfo.admins.includes(userId);
      }

      logger.warn('Group admin check requested but no thread info provided');
      return false;
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
      2: 'Group Admin',
      3: 'Bot Developer'
    };
    return roles[role] || 'Unknown';
  }

  /**
   * Get user's highest role
   * @param {string} userId - User ID
   * @param {Object} threadInfo - Thread information (optional)
   * @returns {number} Highest role number
   */
  static getUserRole(userId, threadInfo = null) {
    if (userId === config.DEVELOPER_ID) {
      return 3;
    }

    if (config.BOT_ADMINS.includes(userId)) {
      return 1;
    }

    if (threadInfo && threadInfo.admins && threadInfo.admins.includes(userId)) {
      return 2;
    }

    return 0;
  }
}

export default PermissionManager;
