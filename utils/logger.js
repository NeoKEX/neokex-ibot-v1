const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Ensure logs directory exists
if (!fs.existsSync(config.LOGS_PATH)) {
  fs.mkdirSync(config.LOGS_PATH, { recursive: true });
}

// Color codes for custom formatting
const colors = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
  debug: '\x1b[90m',
  success: '\x1b[32m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Custom clean console format
const cleanConsoleFormat = winston.format.printf(({ level, message, type, ...metadata }) => {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  
  // Map log levels to cleaner icons
  const icons = {
    error: '✗',
    warn: '⚠',
    info: '●',
    debug: '○',
    success: '✓'
  };
  
  const icon = icons[level] || icons[type] || '●';
  
  // Clean level names
  const levelMap = {
    error: 'ERROR',
    warn: 'WARN',
    info: 'INFO',
    debug: 'DEBUG'
  };
  
  const levelName = levelMap[level] || level.toUpperCase();
  const color = colors[type] || colors[level] || colors.info;
  
  // Format: [TIME] ● LEVEL | Message
  let output = `${colors.reset}[${timestamp}] ${color}${icon} ${levelName.padEnd(5)}${colors.reset} │ ${message}`;
  
  // Only show metadata if it exists and is not just 'service'
  const filteredMetadata = { ...metadata };
  delete filteredMetadata.service;
  delete filteredMetadata.level;
  delete filteredMetadata.timestamp;
  
  if (Object.keys(filteredMetadata).length > 0) {
    output += ` ${colors.debug}${JSON.stringify(filteredMetadata)}${colors.reset}`;
  }
  
  return output;
});

const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'instagram-bot' },
  transports: [
    // Error logs (file only)
    new winston.transports.File({
      filename: path.join(config.LOGS_PATH, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5
    }),
    // Combined logs (file only)
    new winston.transports.File({
      filename: path.join(config.LOGS_PATH, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5
    }),
    // Clean console output
    new winston.transports.Console({
      format: cleanConsoleFormat
    })
  ]
});

// Add custom success method
logger.success = (message, meta = {}) => {
  logger.log({ level: 'info', type: 'success', message, ...meta });
};

// Add custom command method
logger.command = (commandName, user, success = true) => {
  const message = `${commandName} executed by ${user}`;
  logger.log({ 
    level: success ? 'info' : 'error',
    type: success ? 'success' : 'error',
    message 
  });
};

module.exports = logger;
