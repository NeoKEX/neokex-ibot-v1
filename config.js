import dotenv from 'dotenv';
dotenv.config();

export default {
  // Bot Configuration
  PREFIX: process.env.PREFIX || '!',
  BOT_NAME: process.env.BOT_NAME || 'Instagram Bot',
  AUTO_REPLY: process.env.AUTO_REPLY === 'true' || true,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
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
