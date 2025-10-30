import dotenv from 'dotenv';
dotenv.config();

export default {
  // Bot Configuration
  PREFIX: process.env.PREFIX || '!',
  BOT_NAME: 'NeoKEX iBOT V1',
  BOT_VERSION: '1.0.0',
  AUTHOR: 'NeoKEX',
  GITHUB: 'https://github.com/NeoKEX',
  AUTO_REPLY: process.env.AUTO_REPLY === 'true' || true,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Role System (0: All Users, 1: Bot Admins, 2: Group Admins, 3: Bot Developer)
  BOT_ADMINS: (process.env.BOT_ADMINS || '').split(',').filter(id => id.trim()),
  DEVELOPER_ID: process.env.DEVELOPER_ID || '',
  
  // Session Configuration
  SESSION_SECRET: process.env.SESSION_SECRET || 'default_session_secret',
  AUTO_RECONNECT: process.env.AUTO_RECONNECT === 'true' || true,
  MAX_RECONNECT_ATTEMPTS: parseInt(process.env.MAX_RECONNECT_ATTEMPTS) || 5,
  
  // Rate Limiting
  MESSAGE_DELAY_MS: parseInt(process.env.MESSAGE_DELAY_MS) || 2000,
  COMMAND_COOLDOWN_MS: parseInt(process.env.COMMAND_COOLDOWN_MS) || 3000,
  
  // Polling
  POLLING_INTERVAL_MS: parseInt(process.env.POLLING_INTERVAL_MS) || 5000,
  
  // Paths
  ACCOUNT_FILE: process.env.ACCOUNT_FILE || './account.txt',
  COMMANDS_PATH: './commands',
  EVENTS_PATH: './events',
  LOGS_PATH: './logs',
  DATA_PATH: './data'
};
