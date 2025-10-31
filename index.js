import InstagramChatAPI from 'neokex-ica';
import fs from 'fs';
import config from './config.js';
import logger from './utils/logger.js';
import MessageQueue from './utils/messageQueue.js';
import CommandLoader from './utils/commandLoader.js';
import EventLoader from './utils/eventLoader.js';
import Banner from './utils/banner.js';

class InstagramBot {
  constructor() {
    this.ig = new InstagramChatAPI();
    this.api = null;
    this.userID = null;
    this.username = null;
    this.messageQueue = new MessageQueue();
    this.commandLoader = new CommandLoader();
    this.eventLoader = new EventLoader(this);
    this.reconnectAttempts = 0;
    this.shouldReconnect = config.AUTO_RECONNECT;
    this.isRunning = false;
    this.processedMessages = new Set();
  }

  /**
   * Initialize and start the bot
   */
  async start() {
    try {
      // Display premium banner
      Banner.display();
      
      logger.info('Starting Instagram Bot...');
      Banner.info('Initializing bot components...');
      
      // Load commands and events
      await this.commandLoader.loadCommands();
      await this.eventLoader.loadEvents();
      this.eventLoader.registerEvents();

      // Load cookies and connect
      await this.loadCookies();
      await this.connect();

      // Setup message listener
      this.setupMessageListener();

      // Mark as running
      this.isRunning = true;

      // Trigger ready event
      await this.eventLoader.handleEvent('ready', {});

      // Start listening for messages
      await this.ig.dm.startPolling(config.POLLING_INTERVAL_MS);
      logger.info(`Started polling for messages (interval: ${config.POLLING_INTERVAL_MS}ms)`);

      // Keep the process alive
      this.keepAlive();
    } catch (error) {
      logger.error('Failed to start bot', {
        error: error.message,
        stack: error.stack
      });
      
      await this.eventLoader.handleEvent('error', error);
      
      if (this.shouldReconnect && this.reconnectAttempts < config.MAX_RECONNECT_ATTEMPTS) {
        this.reconnect();
      } else {
        logger.error('Unable to start bot, exiting...');
        process.exit(1);
      }
    }
  }

  /**
   * Load cookies from account.txt file
   */
  async loadCookies() {
    try {
      logger.info('Loading cookies from account.txt...');
      
      if (!fs.existsSync(config.ACCOUNT_FILE)) {
        throw new Error(`Cookie file not found: ${config.ACCOUNT_FILE}`);
      }

      // Check if file has valid cookies (not just the template)
      const content = fs.readFileSync(config.ACCOUNT_FILE, 'utf-8');
      const hasValidCookies = content.split('\n').some(line => {
        const trimmedLine = line.trim();
        // Skip empty lines and comment lines (but #HttpOnly_ is valid!)
        if (trimmedLine === '' || (trimmedLine.startsWith('#') && !trimmedLine.startsWith('#HttpOnly'))) {
          return false;
        }
        // Check if line contains sessionid
        return trimmedLine.includes('sessionid');
      });

      if (!hasValidCookies) {
        throw new Error('account.txt contains no valid cookies. Please add your Instagram cookies in Netscape format.');
      }

      this.ig.loadCookiesFromFile(config.ACCOUNT_FILE);
      logger.info('Cookies loaded successfully');
    } catch (error) {
      logger.error('Failed to load cookies', { error: error.message });
      throw error;
    }
  }

  /**
   * Connect to Instagram and verify authentication
   */
  async connect() {
    try {
      logger.info('Connecting to Instagram...');

      // Get current user info to verify authentication
      try {
        this.userID = this.ig.getCurrentUserID();
        this.username = this.ig.getCurrentUsername();
        logger.info('Successfully authenticated with Instagram', {
          userID: this.userID,
          username: this.username
        });
      } catch (error) {
        logger.warn('Could not fetch user info, but cookies are loaded', { 
          error: error.message 
        });
        // Even if we can't get user info, we might still be authenticated
        this.userID = 'unknown';
        this.username = 'unknown';
      }

      // Set up API wrapper
      this.api = this.createAPIWrapper();
      
      this.reconnectAttempts = 0;
      logger.info('Bot connected successfully');
    } catch (error) {
      logger.error('Failed to connect to Instagram', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Create API wrapper with commonly used methods
   */
  createAPIWrapper() {
    const self = this;
    
    return {
      sendMessage: async (text, threadId) => {
        return new Promise((resolve, reject) => {
          self.messageQueue.add(async () => {
            try {
              const result = await self.ig.dm.sendMessage(threadId, text);
              logger.debug('Message sent', { threadId, messageLength: text.length });
              resolve(result);
            } catch (error) {
              logger.error('Failed to send message', {
                error: error.message,
                threadId
              });
              reject(error);
            }
          });
        });
      },

      sendMessageToUser: async (text, userId) => {
        return new Promise((resolve, reject) => {
          self.messageQueue.add(async () => {
            try {
              const result = await self.ig.dm.sendMessageToUser(userId, text);
              logger.debug('Direct message sent to user', { userId, messageLength: text.length });
              resolve(result);
            } catch (error) {
              logger.error('Failed to send direct message', {
                error: error.message,
                userId
              });
              reject(error);
            }
          });
        });
      },

      getThread: async (threadId) => {
        try {
          const thread = await self.ig.dm.getThread(threadId);
          return thread;
        } catch (error) {
          logger.error('Failed to get thread', {
            error: error.message,
            threadId
          });
          throw error;
        }
      },

      getInbox: async () => {
        try {
          const inbox = await self.ig.getInbox();
          return inbox;
        } catch (error) {
          logger.error('Failed to get inbox', {
            error: error.message
          });
          throw error;
        }
      },

      markAsSeen: async (threadId, itemId) => {
        try {
          await self.ig.dm.markAsSeen(threadId, itemId);
          logger.debug('Message marked as seen', { threadId, itemId });
        } catch (error) {
          logger.error('Failed to mark as seen', {
            error: error.message,
            threadId,
            itemId
          });
        }
      },

      sendPhoto: async (photoPath, threadId, caption = '') => {
        return new Promise((resolve, reject) => {
          self.messageQueue.add(async () => {
            try {
              const result = await self.ig.dm.sendPhoto(threadId, photoPath);
              logger.debug('Photo sent', { threadId, photoPath });
              Banner.success(`Photo sent to thread ${threadId}`);
              resolve(result);
            } catch (error) {
              logger.error('Failed to send photo', {
                error: error.message,
                threadId,
                photoPath
              });
              Banner.error('Send Photo', error.message);
              reject(error);
            }
          });
        });
      },

      sendVideo: async (videoPath, threadId, caption = '') => {
        return new Promise((resolve, reject) => {
          self.messageQueue.add(async () => {
            try {
              const result = await self.ig.dm.sendVideo(threadId, videoPath);
              logger.debug('Video sent', { threadId, videoPath });
              Banner.success(`Video sent to thread ${threadId}`);
              resolve(result);
            } catch (error) {
              logger.error('Failed to send video', {
                error: error.message,
                threadId,
                videoPath
              });
              Banner.error('Send Video', error.message);
              reject(error);
            }
          });
        });
      },

      sendAudio: async (audioPath, threadId) => {
        return new Promise((resolve, reject) => {
          self.messageQueue.add(async () => {
            try {
              const result = await self.ig.dm.sendVoiceNote(threadId, audioPath);
              logger.debug('Audio sent', { threadId, audioPath });
              Banner.success(`Audio sent to thread ${threadId}`);
              resolve(result);
            } catch (error) {
              logger.error('Failed to send audio', {
                error: error.message,
                threadId,
                audioPath
              });
              Banner.error('Send Audio', error.message);
              reject(error);
            }
          });
        });
      }
    };
  }

  /**
   * Setup message listener using neokex-ica's event system
   */
  setupMessageListener() {
    logger.info('Setting up message listener...');

    this.ig.on('message', async (message) => {
      try {
        await this.handleMessage(message);
      } catch (error) {
        logger.error('Error in message listener', {
          error: error.message,
          stack: error.stack
        });
      }
    });

    logger.info('Message listener configured');
  }

  /**
   * Handle incoming messages
   */
  async handleMessage(message) {
    try {
      // Create a unique ID for this message to prevent duplicates
      const messageId = `${message.threadId}-${message.itemId || message.timestamp}`;
      
      // Skip if we've already processed this message
      if (this.processedMessages.has(messageId)) {
        return;
      }
      
      // Add to processed set
      this.processedMessages.add(messageId);
      
      // Clean up old processed messages (keep last 1000)
      if (this.processedMessages.size > 1000) {
        const toDelete = Array.from(this.processedMessages).slice(0, 100);
        toDelete.forEach(id => this.processedMessages.delete(id));
      }

      // Transform message to event format
      const event = {
        threadId: message.threadId || message.thread_id,
        messageId: message.itemId || message.item_id || messageId,
        senderID: message.userId || message.user_id || message.senderId,
        body: message.text || message.message || '',
        timestamp: message.timestamp || Date.now(),
        type: message.itemType || message.item_type || 'text'
      };

      // Ignore messages from self
      if (event.senderID === this.userID) {
        return;
      }

      // Handle message event
      await this.eventLoader.handleEvent('message', event);

      // Auto mark as seen if configured
      if (event.messageId && event.threadId) {
        try {
          await this.api.markAsSeen(event.threadId, event.messageId);
        } catch (error) {
          logger.debug('Could not mark message as seen', { error: error.message });
        }
      }
    } catch (error) {
      logger.error('Error in handleMessage', {
        error: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Reconnect to Instagram
   */
  async reconnect() {
    this.reconnectAttempts++;
    
    logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${config.MAX_RECONNECT_ATTEMPTS})...`);
    
    if (this.reconnectAttempts >= config.MAX_RECONNECT_ATTEMPTS) {
      logger.error('Max reconnection attempts reached. Stopping bot.');
      process.exit(1);
    }

    // Stop listening
    if (this.ig && this.ig.stopListening) {
      this.ig.stopListening();
    }

    setTimeout(async () => {
      try {
        // Create new instance
        this.ig = new InstagramChatAPI();
        await this.loadCookies();
        await this.connect();
        this.setupMessageListener();
        await this.ig.startListening(config.POLLING_INTERVAL_MS);
        logger.info('Reconnected successfully');
        this.isRunning = true;
      } catch (error) {
        logger.error('Reconnection failed', { error: error.message });
        this.reconnect();
      }
    }, 5000);
  }

  /**
   * Keep process alive and handle graceful shutdown
   */
  keepAlive() {
    // Handle graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      
      this.isRunning = false;
      this.shouldReconnect = false;
      
      // Stop listening
      if (this.ig && this.ig.stopListening) {
        this.ig.stopListening();
        logger.info('Stopped listening for messages');
      }
      
      // Clear message queue
      logger.info('Clearing message queue...');
      this.messageQueue.clear();
      
      logger.info('Bot shutdown complete');
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    
    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', {
        error: error.message,
        stack: error.stack
      });
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', {
        reason: reason,
        promise: promise
      });
    });
  }
}

// Start the bot
const bot = new InstagramBot();
bot.start().catch(error => {
  logger.error('Fatal error starting bot', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

export default InstagramBot;
