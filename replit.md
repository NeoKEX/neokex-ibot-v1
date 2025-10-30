# Instagram Bot Project

## Overview
This is a highly advanced Instagram bot built with Node.js and the neokex-ica chat API. The bot is designed to handle Instagram messages, commands, and events similar to GoatbotV2's architecture.

## Recent Changes
- **2025-10-30**: Initial project setup
  - Installed Node.js 20 and dependencies (neokex-ica, winston, dotenv, node-cron, axios, tough-cookie)
  - Created complete bot architecture with command and event systems
  - Implemented cookie-based authentication using Netscape format
  - Added comprehensive error handling and auto-reconnect functionality
  - Created logging system with winston
  - Built message queue with rate limiting
  - Added dynamic command loader with cooldown support
  - Created event handling system
  - Added example commands: help, ping, info, echo
  - Added event handlers: message, ready, error

## Project Architecture
```
├── index.js              # Main bot engine with Instagram connection
├── config.js             # Configuration management
├── account.txt           # Instagram cookies in Netscape format (user must provide)
├── commands/             # Command modules
│   ├── help.js          # Show available commands
│   ├── ping.js          # Check bot response time
│   ├── info.js          # Bot information
│   └── echo.js          # Echo messages
├── events/              # Event handlers
│   ├── message.js       # Handle incoming messages and commands
│   ├── ready.js         # Bot connected event
│   └── error.js         # Error handling and auto-reconnect
├── utils/               # Utility modules
│   ├── logger.js        # Winston logging system
│   ├── cookieParser.js  # Parse Netscape cookie format
│   ├── messageQueue.js  # Message queue with rate limiting
│   ├── commandLoader.js # Dynamic command loading
│   └── eventLoader.js   # Event system management
├── logs/                # Log files (auto-generated)
└── data/                # Persistent data storage
```

## User Preferences
None set yet.

## Setup Instructions
1. The bot requires Instagram cookies in Netscape format saved to `account.txt`
2. Users should export their Instagram cookies using a browser extension
3. Required cookies: sessionid, csrftoken, ds_user_id
4. Run with `npm start` or `node index.js`

## Key Features
- Cookie-based Instagram authentication
- Comprehensive event handling system
- Command system with prefix support (default: !)
- Automatic error recovery and reconnection
- Message queue to prevent rate limiting
- Advanced logging with file and console output
- Dynamic command and event loading
- Cooldown system for commands
- Graceful shutdown handling

## Dependencies
- neokex-ica: Instagram Chat API
- winston: Advanced logging
- tough-cookie: Cookie parsing
- dotenv: Environment configuration
- node-cron: Task scheduling
- axios: HTTP requests

## Current State
Project structure is complete and ready for use. Bot will start once user provides valid Instagram cookies in account.txt file.
