const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Ensure logs directory exists
if (!fs.existsSync(config.LOGS_PATH)) {
  fs.mkdirSync(config.LOGS_PATH, { recursive: true });
}

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
    // Error logs
    new winston.transports.File({
      filename: path.join(config.LOGS_PATH, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join(config.LOGS_PATH, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5
    }),
    // Console output with color
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...metadata }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
          }
          return msg;
        })
      )
    })
  ]
});

module.exports = logger;
