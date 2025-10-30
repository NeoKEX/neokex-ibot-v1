# Advanced Instagram Bot

A highly advanced Instagram bot similar to GoatbotV2, built with Node.js and the neokex-ica chat API.

## Features

- 🔐 Cookie-based authentication (Netscape format)
- 💬 Comprehensive message handling
- 🤖 Dynamic command system with cooldowns
- 📝 Event-driven architecture
- 🔄 Auto-reconnect with error recovery
- 📊 Advanced logging system
- ⚡ Message queue with rate limiting
- 🎯 Plugin/module support

## Setup

### 1. Install Dependencies

Dependencies are already installed via npm.

### 2. Configure Instagram Cookies

You need to provide your Instagram session cookies in Netscape format:

1. Login to Instagram in your browser
2. Use a browser extension like "EditThisCookie" or "Get cookies.txt LOCALLY"
3. Export cookies in Netscape format
4. Save them to `account.txt` file

Required cookies:
- `sessionid`
- `csrftoken`
- `ds_user_id` (optional but recommended)

### 3. Configure Environment

Edit the configuration in `config.js` to customize:
- Command prefix (default: `!`)
- Bot name
- Auto-reply settings
- Rate limiting
- Logging level

### 4. Run the Bot

```bash
node index.js
```

## Commands

The bot comes with several built-in commands:

- `!help` - Show all available commands
- `!ping` - Check bot response time
- `!info` - Show bot information
- `!echo <message>` - Repeat your message

## Creating Custom Commands

Create a new file in the `commands/` directory:

```javascript
module.exports = {
  config: {
    name: 'commandname',
    aliases: ['alias1', 'alias2'],
    description: 'Command description',
    usage: 'commandname [args]',
    cooldown: 5 // seconds
  },

  async run({ api, event, args, bot }) {
    // Command logic here
    await api.sendMessage('Response', event.threadId);
  }
};
```

## Creating Custom Events

Create a new file in the `events/` directory:

```javascript
module.exports = {
  config: {
    name: 'eventname',
    description: 'Event description'
  },

  async run(bot, data) {
    // Event handling logic
  }
};
```

## Architecture

```
├── index.js              # Main bot engine
├── config.js             # Configuration
├── account.txt           # Instagram cookies (Netscape format)
├── commands/             # Command modules
│   ├── help.js
│   ├── ping.js
│   └── ...
├── events/               # Event handlers
│   ├── message.js
│   ├── ready.js
│   └── error.js
├── utils/                # Utility modules
│   ├── logger.js         # Logging system
│   ├── cookieParser.js   # Cookie parser
│   ├── messageQueue.js   # Message queue
│   ├── commandLoader.js  # Command loader
│   └── eventLoader.js    # Event loader
├── logs/                 # Log files
└── data/                 # Persistent data
```

## Error Handling

The bot includes comprehensive error handling:

- Automatic reconnection on connection loss
- Graceful degradation on errors
- Detailed error logging
- Command-level error catching

## Logging

Logs are saved in the `logs/` directory:

- `combined.log` - All logs
- `error.log` - Error logs only

Console output includes colored, formatted logs for easy monitoring.

## Security

- Never commit your `account.txt` file
- Keep your cookies secure
- Use environment variables for sensitive data
- Regularly refresh your session cookies

## Troubleshooting

### Bot won't connect
- Check that your cookies are valid and recent
- Ensure `sessionid` and `csrftoken` are present
- Try logging out and back into Instagram to get fresh cookies

### Commands not working
- Verify the command prefix matches your configuration
- Check that commands are properly formatted
- Review logs for any errors

### Rate limiting
- Adjust `MESSAGE_DELAY_MS` in config
- Reduce message frequency
- The bot automatically queues messages to prevent rate limiting

## License

ISC

## Support

For issues and questions, check the logs directory for detailed error information.
