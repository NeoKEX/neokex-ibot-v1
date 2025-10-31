const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Load config.json
let configJSON = {};
const configPath = './config.json';

try {
  if (fs.existsSync(configPath)) {
    const configData = fs.readFileSync(configPath, 'utf-8');
    configJSON = JSON.parse(configData);
  }
} catch (error) {
  console.error('Error loading config.json:', error.message);
}

// Merge config.json with environment variables (env vars take priority)
module.exports = {
  // Bot Configuration
  PREFIX: process.env.PREFIX || configJSON.bot?.prefix || '!',
  BOT_NAME: process.env.BOT_NAME || configJSON.bot?.name || 'NeoKEX iBOT V1',
  BOT_VERSION: configJSON.bot?.version || '1.0.0',
  AUTHOR: configJSON.bot?.author || 'NeoKEX',
  GITHUB: configJSON.bot?.github || 'https://github.com/NeoKEX',
  BOT_DESCRIPTION: configJSON.bot?.description || 'Advanced Instagram Bot',
  
  // Permissions
  BOT_ADMINS: process.env.BOT_ADMINS 
    ? process.env.BOT_ADMINS.split(',').filter(id => id.trim())
    : (configJSON.permissions?.admins || []),
  DEVELOPER_ID: process.env.DEVELOPER_ID || configJSON.permissions?.developer || '',
  
  // Whitelist/Blacklist
  WHITELIST_ENABLED: configJSON.permissions?.whitelist?.enabled || false,
  WHITELIST_USERS: configJSON.permissions?.whitelist?.users || [],
  BLACKLIST_ENABLED: configJSON.permissions?.blacklist?.enabled || false,
  BLACKLIST_USERS: configJSON.permissions?.blacklist?.users || [],
  
  // Features
  AUTO_REPLY: process.env.AUTO_REPLY === 'true' || configJSON.features?.autoReply || true,
  AUTO_READ: configJSON.features?.autoRead !== false,
  AUTO_REACT: configJSON.features?.autoReact || false,
  TYPING_INDICATOR: configJSON.features?.typingIndicator !== false,
  ANTI_SPAM: configJSON.features?.antiSpam !== false,
  COMMAND_LOGGING: configJSON.features?.commandLogging !== false,
  
  // Welcome Message
  WELCOME_MESSAGE_ENABLED: configJSON.features?.welcomeMessage?.enabled || false,
  WELCOME_MESSAGE: configJSON.features?.welcomeMessage?.message || 'Hello! Thanks for messaging me.',
  
  // Moderation
  ANTI_SPAM_ENABLED: configJSON.moderation?.antiSpam?.enabled !== false,
  MAX_MESSAGES_PER_MINUTE: configJSON.moderation?.antiSpam?.maxMessagesPerMinute || 10,
  SPAM_BAN_DURATION: configJSON.moderation?.antiSpam?.banDuration || 300000,
  SPAM_WARNING_MESSAGE: configJSON.moderation?.antiSpam?.warningMessage || '⚠️ Please slow down!',
  
  AUTO_BLOCK_ENABLED: configJSON.moderation?.autoBlock?.enabled || false,
  BLOCK_ON_SPAM: configJSON.moderation?.autoBlock?.blockOnSpam || false,
  BAD_WORDS: configJSON.moderation?.autoBlock?.badWords || [],
  
  // Rate Limiting
  MESSAGE_DELAY_MS: parseInt(process.env.MESSAGE_DELAY_MS) || configJSON.rateLimiting?.messageDelay || 2000,
  COMMAND_COOLDOWN_MS: parseInt(process.env.COMMAND_COOLDOWN_MS) || configJSON.rateLimiting?.commandCooldown || 3000,
  PHOTO_COOLDOWN_MS: configJSON.rateLimiting?.photoCooldown || 5000,
  VIDEO_COOLDOWN_MS: configJSON.rateLimiting?.videoCooldown || 5000,
  MAX_COMMANDS_PER_MINUTE: configJSON.rateLimiting?.maxCommandsPerMinute || 20,
  
  // Polling
  POLLING_INTERVAL_MS: parseInt(process.env.POLLING_INTERVAL_MS) || configJSON.polling?.interval || 5000,
  RETRY_ON_ERROR: configJSON.polling?.retryOnError !== false,
  MAX_RETRIES: configJSON.polling?.maxRetries || 3,
  RETRY_DELAY: configJSON.polling?.retryDelay || 10000,
  
  // Connection
  AUTO_RECONNECT: process.env.AUTO_RECONNECT === 'true' || configJSON.connection?.autoReconnect !== false,
  MAX_RECONNECT_ATTEMPTS: parseInt(process.env.MAX_RECONNECT_ATTEMPTS) || configJSON.connection?.maxReconnectAttempts || 5,
  RECONNECT_DELAY: configJSON.connection?.reconnectDelay || 5000,
  SESSION_TIMEOUT: configJSON.connection?.sessionTimeout || 3600000,
  
  // Commands
  CASE_SENSITIVE: configJSON.commands?.caseSensitive || false,
  ALLOW_ALIASES: configJSON.commands?.allowAliases !== false,
  DM_ONLY: configJSON.commands?.dmOnly || false,
  GROUP_ONLY: configJSON.commands?.groupOnly || false,
  DISABLED_COMMANDS: configJSON.commands?.disabledCommands || [],
  
  // Response Messages
  ERROR_MESSAGES: {
    NO_PERMISSION: configJSON.responses?.errorMessages?.noPermission || "❌ You don't have permission to use this command.",
    ADMIN_ONLY: configJSON.responses?.errorMessages?.adminOnly || "🔒 This command is only available to admins.",
    DEVELOPER_ONLY: configJSON.responses?.errorMessages?.developerOnly || "👨‍💻 This command is only available to the developer.",
    COOLDOWN: configJSON.responses?.errorMessages?.cooldown || "⏱️ Please wait {time} seconds before using this command again.",
    COMMAND_NOT_FOUND: configJSON.responses?.errorMessages?.commandNotFound || "❓ Command not found. Type !help for available commands.",
    WHITELIST_ONLY: configJSON.responses?.errorMessages?.whitelistOnly || "⚠️ This bot is in whitelist mode. You are not authorized.",
    BLACKLISTED: configJSON.responses?.errorMessages?.blacklisted || "🚫 You have been blacklisted from using this bot."
  },
  
  SUCCESS_MESSAGES: {
    COMMAND_EXECUTED: configJSON.responses?.successMessages?.commandExecuted || "✅ Command executed successfully!",
    MESSAGE_SENT: configJSON.responses?.successMessages?.messageSent || "✅ Message sent!",
    PHOTO_SENT: configJSON.responses?.successMessages?.photoSent || "✅ Photo sent!",
    VIDEO_SENT: configJSON.responses?.successMessages?.videoSent || "✅ Video sent!"
  },
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || configJSON.logging?.level || 'debug',
  ENABLE_FILE_LOGGING: configJSON.logging?.enableFileLogging !== false,
  ENABLE_CONSOLE_LOGGING: configJSON.logging?.enableConsoleLogging !== false,
  LOG_COMMANDS: configJSON.logging?.logCommands !== false,
  LOG_MESSAGES: configJSON.logging?.logMessages !== false,
  LOG_ERRORS: configJSON.logging?.logErrors !== false,
  MAX_LOG_SIZE: configJSON.logging?.maxLogSize || '10m',
  MAX_LOG_FILES: configJSON.logging?.maxLogFiles || 5,
  
  // Paths
  ACCOUNT_FILE: process.env.ACCOUNT_FILE || configJSON.paths?.account || './account.txt',
  COMMANDS_PATH: configJSON.paths?.commands || './commands',
  EVENTS_PATH: configJSON.paths?.events || './events',
  LOGS_PATH: configJSON.paths?.logs || './logs',
  DATA_PATH: configJSON.paths?.data || './data',
  TEMP_PATH: configJSON.paths?.temp || './temp',
  
  // Database
  DATABASE_ENABLED: configJSON.database?.enabled || false,
  DATABASE_TYPE: configJSON.database?.type || 'json',
  DATABASE_PATH: configJSON.database?.path || './data/database.json',
  DATABASE_AUTO_SAVE: configJSON.database?.autoSave !== false,
  DATABASE_SAVE_INTERVAL: configJSON.database?.saveInterval || 60000,
  
  // Notifications
  NOTIFY_ON_START: configJSON.notifications?.onStart !== false,
  NOTIFY_ON_ERROR: configJSON.notifications?.onError !== false,
  NOTIFY_ON_NEW_USER: configJSON.notifications?.onNewUser || false,
  NOTIFY_ADMIN_ENABLED: configJSON.notifications?.notifyAdmin?.enabled || false,
  NOTIFY_ADMIN_ID: configJSON.notifications?.notifyAdmin?.adminId || '',
  NOTIFY_ADMIN_EVENTS: configJSON.notifications?.notifyAdmin?.events || ['error'],
  
  // Advanced
  DEBUG_MODE: process.env.DEBUG_MODE === 'true' || configJSON.advanced?.debugMode || false,
  VERBOSE_LOGGING: configJSON.advanced?.verboseLogging || false,
  CACHE_MESSAGES: configJSON.advanced?.cacheMessages !== false,
  MAX_CACHE_SIZE: configJSON.advanced?.maxCacheSize || 1000,
  CLEANUP_INTERVAL: configJSON.advanced?.cleanupInterval || 3600000,
  TIMEZONE: configJSON.advanced?.timezone || 'UTC',
  LANGUAGE: configJSON.advanced?.language || 'en',
  
  // Session (legacy)
  SESSION_SECRET: process.env.SESSION_SECRET || 'default_session_secret'
};
