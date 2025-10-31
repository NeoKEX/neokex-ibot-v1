const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const config = require('../config');

class Database {
  constructor() {
    this.dbPath = path.resolve(config.DATA_PATH, 'database.json');
    this.data = {
      users: {},
      threads: {},
      stats: {},
      economy: {},
      reminders: [],
      autoResponses: [],
      welcomedUsers: new Set(),
      bannedUsers: new Set(),
      spamWarnings: {},
      lastMessages: {},
      sentMessages: {},
      processedMessages: {}
    };
    this.ensureDataDirectory();
    this.load();
    
    if (config.DATABASE_AUTO_SAVE) {
      this.startAutoSave();
    }
  }

  ensureDataDirectory() {
    if (!fs.existsSync(config.DATA_PATH)) {
      fs.mkdirSync(config.DATA_PATH, { recursive: true });
      logger.info('Created data directory');
    }
  }

  load() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const rawData = fs.readFileSync(this.dbPath, 'utf-8');
        const parsed = JSON.parse(rawData);
        
        this.data = {
          users: parsed.users || {},
          threads: parsed.threads || {},
          stats: parsed.stats || {},
          economy: parsed.economy || {},
          reminders: parsed.reminders || [],
          autoResponses: parsed.autoResponses || [],
          welcomedUsers: new Set(parsed.welcomedUsers || []),
          bannedUsers: new Set(parsed.bannedUsers || []),
          spamWarnings: parsed.spamWarnings || {},
          lastMessages: parsed.lastMessages || {},
          sentMessages: parsed.sentMessages || {},
          processedMessages: parsed.processedMessages || {}
        };
        
        logger.info('Database loaded successfully');
      } else {
        this.save();
        logger.info('Created new database');
      }
    } catch (error) {
      logger.error('Failed to load database', { error: error.message });
      this.data = {
        users: {},
        threads: {},
        stats: {},
        economy: {},
        reminders: [],
        autoResponses: [],
        welcomedUsers: new Set(),
        bannedUsers: new Set(),
        spamWarnings: {},
        lastMessages: {},
        sentMessages: {},
        processedMessages: {}
      };
    }
  }

  save() {
    try {
      const dataToSave = {
        ...this.data,
        welcomedUsers: Array.from(this.data.welcomedUsers),
        bannedUsers: Array.from(this.data.bannedUsers)
      };
      
      fs.writeFileSync(this.dbPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      logger.debug('Database saved successfully');
    } catch (error) {
      logger.error('Failed to save database', { error: error.message });
    }
  }

  startAutoSave() {
    setInterval(() => {
      this.save();
    }, config.DATABASE_SAVE_INTERVAL || 60000);
    logger.info('Auto-save enabled');
  }

  // User methods
  getUser(userId) {
    if (!this.data.users[userId]) {
      this.data.users[userId] = {
        id: userId,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        messageCount: 0,
        commandCount: 0
      };
    }
    return this.data.users[userId];
  }

  updateUser(userId, updates) {
    const user = this.getUser(userId);
    Object.assign(user, updates, { lastSeen: Date.now() });
    this.data.users[userId] = user;
    return user;
  }

  // Economy methods
  getBalance(userId) {
    if (!this.data.economy[userId]) {
      this.data.economy[userId] = {
        balance: 1000,
        bank: 0,
        lastDaily: 0,
        lastWork: 0
      };
    }
    return this.data.economy[userId];
  }

  addBalance(userId, amount) {
    const economy = this.getBalance(userId);
    economy.balance += amount;
    this.data.economy[userId] = economy;
    return economy.balance;
  }

  // Stats methods
  incrementStat(key) {
    if (!this.data.stats[key]) {
      this.data.stats[key] = 0;
    }
    this.data.stats[key]++;
  }

  getStat(key) {
    return this.data.stats[key] || 0;
  }

  // Welcome tracking
  hasBeenWelcomed(userId) {
    return this.data.welcomedUsers.has(userId);
  }

  markAsWelcomed(userId) {
    this.data.welcomedUsers.add(userId);
  }

  // Ban management
  isBanned(userId) {
    return this.data.bannedUsers.has(userId);
  }

  banUser(userId) {
    this.data.bannedUsers.add(userId);
    logger.info(`User ${userId} has been banned`);
  }

  unbanUser(userId) {
    this.data.bannedUsers.delete(userId);
    logger.info(`User ${userId} has been unbanned`);
  }

  // Spam tracking
  trackMessage(userId) {
    const now = Date.now();
    
    if (!this.data.lastMessages[userId]) {
      this.data.lastMessages[userId] = [];
    }
    
    this.data.lastMessages[userId].push(now);
    
    const oneMinuteAgo = now - 60000;
    this.data.lastMessages[userId] = this.data.lastMessages[userId].filter(
      timestamp => timestamp > oneMinuteAgo
    );
    
    return this.data.lastMessages[userId].length;
  }

  getMessageCount(userId) {
    if (!this.data.lastMessages[userId]) {
      return 0;
    }
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    this.data.lastMessages[userId] = this.data.lastMessages[userId].filter(
      timestamp => timestamp > oneMinuteAgo
    );
    return this.data.lastMessages[userId].length;
  }

  addSpamWarning(userId) {
    if (!this.data.spamWarnings[userId]) {
      this.data.spamWarnings[userId] = {
        count: 0,
        lastWarning: 0
      };
    }
    this.data.spamWarnings[userId].count++;
    this.data.spamWarnings[userId].lastWarning = Date.now();
    return this.data.spamWarnings[userId].count;
  }

  getSpamWarnings(userId) {
    return this.data.spamWarnings[userId] || { count: 0, lastWarning: 0 };
  }

  // Auto-responses
  addAutoResponse(trigger, response, createdBy) {
    const autoResponse = {
      id: Date.now().toString(),
      trigger,
      response,
      createdBy,
      createdAt: Date.now()
    };
    this.data.autoResponses.push(autoResponse);
    return autoResponse;
  }

  removeAutoResponse(id) {
    const index = this.data.autoResponses.findIndex(ar => ar.id === id);
    if (index > -1) {
      this.data.autoResponses.splice(index, 1);
      return true;
    }
    return false;
  }

  getAutoResponses() {
    return this.data.autoResponses;
  }

  findAutoResponse(message) {
    return this.data.autoResponses.find(ar => 
      message.toLowerCase().includes(ar.trigger.toLowerCase())
    );
  }

  // Reminders
  addReminder(userId, message, triggerTime) {
    const reminder = {
      id: Date.now().toString(),
      userId,
      message,
      triggerTime,
      createdAt: Date.now()
    };
    this.data.reminders.push(reminder);
    return reminder;
  }

  getDueReminders() {
    const now = Date.now();
    return this.data.reminders.filter(r => r.triggerTime <= now);
  }

  removeReminder(id) {
    const index = this.data.reminders.findIndex(r => r.id === id);
    if (index > -1) {
      this.data.reminders.splice(index, 1);
      return true;
    }
    return false;
  }

  // Utility methods
  getAllUsers() {
    return Object.values(this.data.users);
  }

  getAllStats() {
    return this.data.stats;
  }

  clearOldData() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    Object.keys(this.data.lastMessages).forEach(userId => {
      const recentMessages = this.data.lastMessages[userId].filter(
        timestamp => timestamp > thirtyDaysAgo
      );
      if (recentMessages.length === 0) {
        delete this.data.lastMessages[userId];
      } else {
        this.data.lastMessages[userId] = recentMessages;
      }
    });
    
    logger.info('Cleared old data from database');
  }

  // Thread methods
  getThreadData(threadId) {
    if (!this.data.threads[threadId]) {
      this.data.threads[threadId] = {
        id: threadId,
        prefix: null,
        settings: {},
        createdAt: Date.now()
      };
    }
    return this.data.threads[threadId];
  }

  setThreadData(threadId, data) {
    const threadData = this.getThreadData(threadId);
    Object.assign(threadData, data);
    this.data.threads[threadId] = threadData;
    return threadData;
  }

  deleteThreadData(threadId) {
    if (this.data.threads[threadId]) {
      delete this.data.threads[threadId];
      return true;
    }
    return false;
  }

  // Sent message tracking (for unsend functionality)
  storeSentMessage(threadId, itemId) {
    if (!this.data.sentMessages[threadId]) {
      this.data.sentMessages[threadId] = [];
    }
    
    this.data.sentMessages[threadId].push({
      itemId: itemId,
      timestamp: Date.now()
    });
    
    // Keep only last 50 messages per thread
    if (this.data.sentMessages[threadId].length > 50) {
      this.data.sentMessages[threadId].shift();
    }
    
    logger.debug('Stored sent message', { threadId, itemId });
  }

  getLastSentMessage(threadId) {
    if (!this.data.sentMessages[threadId] || this.data.sentMessages[threadId].length === 0) {
      return null;
    }
    
    const messages = this.data.sentMessages[threadId];
    const lastMessage = messages[messages.length - 1];
    
    return {
      itemId: lastMessage.itemId,
      threadId: threadId,
      timestamp: lastMessage.timestamp
    };
  }

  removeSentMessage(threadId, itemId) {
    if (!this.data.sentMessages[threadId]) {
      return false;
    }
    
    const index = this.data.sentMessages[threadId].findIndex(msg => msg.itemId === itemId);
    if (index > -1) {
      this.data.sentMessages[threadId].splice(index, 1);
      logger.debug('Removed sent message from storage', { threadId, itemId });
      return true;
    }
    
    return false;
  }

  getAllSentMessages(threadId) {
    return this.data.sentMessages[threadId] || [];
  }

  clearOldSentMessages() {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    Object.keys(this.data.sentMessages).forEach(threadId => {
      this.data.sentMessages[threadId] = this.data.sentMessages[threadId].filter(
        msg => msg.timestamp > sevenDaysAgo
      );
      
      if (this.data.sentMessages[threadId].length === 0) {
        delete this.data.sentMessages[threadId];
      }
    });
    
    logger.debug('Cleared old sent messages');
  }

  // Processed message tracking (prevents duplicate processing after restart)
  isMessageProcessed(messageId) {
    return this.data.processedMessages[messageId] !== undefined;
  }

  markMessageAsProcessed(messageId) {
    this.data.processedMessages[messageId] = Date.now();
    
    // Keep only recent processed messages (last 5 minutes) to prevent memory bloat
    this.cleanupProcessedMessages();
  }

  cleanupProcessedMessages() {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const messageIds = Object.keys(this.data.processedMessages);
    
    // Only cleanup if we have more than 1000 processed messages
    if (messageIds.length > 1000) {
      messageIds.forEach(msgId => {
        if (this.data.processedMessages[msgId] < fiveMinutesAgo) {
          delete this.data.processedMessages[msgId];
        }
      });
      
      logger.debug('Cleaned up old processed messages', { 
        remaining: Object.keys(this.data.processedMessages).length 
      });
    }
  }
}

module.exports = new Database();
