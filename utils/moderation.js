const config = require('../config');
const logger = require('./logger');
const database = require('./database');

class ModerationManager {
  checkWhitelist(userId) {
    if (!config.WHITELIST_ENABLED) {
      return true;
    }
    
    const userIdStr = String(userId);
    return config.WHITELIST_USERS.includes(userIdStr);
  }

  checkBlacklist(userId) {
    if (!config.BLACKLIST_ENABLED) {
      return false;
    }
    
    const userIdStr = String(userId);
    return config.BLACKLIST_USERS.includes(userIdStr) || database.isBanned(userIdStr);
  }

  checkSpam(userId) {
    if (!config.ANTI_SPAM_ENABLED) {
      return { isSpam: false };
    }
    
    const messageCount = database.trackMessage(userId);
    const maxMessages = config.MAX_MESSAGES_PER_MINUTE || 10;
    
    if (messageCount > maxMessages) {
      const warnings = database.addSpamWarning(userId);
      
      if (config.BLOCK_ON_SPAM && warnings >= 3) {
        database.banUser(userId);
        return {
          isSpam: true,
          shouldBan: true,
          message: '🚫 You have been automatically banned for spamming.'
        };
      }
      
      return {
        isSpam: true,
        shouldBan: false,
        message: config.SPAM_WARNING_MESSAGE || '⚠️ Please slow down! You\'re sending messages too quickly.'
      };
    }
    
    return { isSpam: false };
  }

  checkBadWords(message) {
    if (!config.AUTO_BLOCK_ENABLED || !config.BAD_WORDS || config.BAD_WORDS.length === 0) {
      return { hasBadWords: false };
    }
    
    const lowerMessage = message.toLowerCase();
    const foundBadWord = config.BAD_WORDS.find(word => 
      lowerMessage.includes(word.toLowerCase())
    );
    
    if (foundBadWord) {
      return {
        hasBadWords: true,
        word: foundBadWord,
        message: '⚠️ Your message contains inappropriate language.'
      };
    }
    
    return { hasBadWords: false };
  }

  async moderateMessage(userId, messageText) {
    const userIdStr = String(userId);
    
    if (this.checkBlacklist(userIdStr)) {
      return {
        allowed: false,
        reason: 'blacklist',
        message: config.BLACKLISTED || '🚫 You have been blacklisted from using this bot.'
      };
    }
    
    if (!this.checkWhitelist(userIdStr)) {
      return {
        allowed: false,
        reason: 'whitelist',
        message: config.WHITELIST_ONLY || '⚠️ This bot is in whitelist mode. You are not authorized to use it.'
      };
    }
    
    const spamCheck = this.checkSpam(userIdStr);
    if (spamCheck.isSpam) {
      return {
        allowed: false,
        reason: 'spam',
        message: spamCheck.message,
        shouldBan: spamCheck.shouldBan
      };
    }
    
    if (messageText) {
      const badWordsCheck = this.checkBadWords(messageText);
      if (badWordsCheck.hasBadWords) {
        if (config.BLOCK_ON_SPAM) {
          database.banUser(userIdStr);
        }
        return {
          allowed: false,
          reason: 'bad_words',
          message: badWordsCheck.message
        };
      }
    }
    
    return { allowed: true };
  }

  getStats() {
    return {
      totalBans: database.data.bannedUsers.size,
      whitelistEnabled: config.WHITELIST_ENABLED,
      blacklistEnabled: config.BLACKLIST_ENABLED,
      antiSpamEnabled: config.ANTI_SPAM_ENABLED,
      badWordsCount: config.BAD_WORDS ? config.BAD_WORDS.length : 0
    };
  }
}

module.exports = new ModerationManager();
