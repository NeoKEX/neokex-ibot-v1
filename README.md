# NeoKEX iBOT V1

```
███╗   ██╗███████╗ ██████╗ ██╗  ██╗███████╗██╗  ██╗
████╗  ██║██╔════╝██╔═══██╗██║ ██╔╝██╔════╝╚██╗██╔╝
██╔██╗ ██║█████╗  ██║   ██║█████╔╝ █████╗   ╚███╔╝ 
██║╚██╗██║██╔══╝  ██║   ██║██╔═██╗ ██╔══╝   ██╔██╗ 
██║ ╚████║███████╗╚██████╔╝██║  ██╗███████╗██╔╝ ██╗
╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝

              ██╗██████╗  ██████╗ ████████╗    ██╗   ██╗ ██╗
              ██║██╔══██╗██╔═══██╗╚══██╔══╝    ██║   ██║███║
              ██║██████╔╝██║   ██║   ██║       ██║   ██║╚██║
              ██║██╔══██╗██║   ██║   ██║       ╚██╗ ██╔╝ ██║
              ██║██████╔╝╚██████╔╝   ██║        ╚████╔╝  ██║
              ╚═╝╚═════╝  ╚═════╝    ╚═╝         ╚═══╝   ╚═╝
```

**A highly advanced Instagram bot similar to GoatbotV2**

👤 **Author:** NeoKEX  
🔗 **GitHub:** https://github.com/NeoKEX  
📦 **Version:** 1.0.0  

---

## ⚠️ CRITICAL WARNING

**DO NOT REMOVE OR MODIFY CREDITS!**

Removing or changing the author credits will result in:
- 🚫 Immediate account ban from support
- ❌ Loss of access to future updates
- 📢 Public exposure of copyright violation
- ⚖️ Possible legal action

**✅ Please respect the original creator's work!**

---

## ✨ Features

### 🔐 **Authentication & Security**
- Cookie-based authentication (Netscape format)
- Role-based permission system (4 levels)
- Secure session management

### 💬 **Messaging Capabilities**
- Send text messages
- Send photos with captions
- Send videos with captions
- Send audio/voice notes
- Auto-reply functionality

### 🛡️ **Role System**
- **Level 0:** All Users - Anyone can use
- **Level 1:** Bot Admins - Defined in config
- **Level 2:** Group Admins - Thread administrators
- **Level 3:** Bot Developer - Ultimate access

### 🤖 **Command System**
- Dynamic command loading
- Command cooldowns
- Author credits on each command
- Alias support
- Permission-based access

### 📊 **Advanced Features**
- Event-driven architecture
- Auto-reconnect with error recovery
- Winston logging system
- Message queue with rate limiting
- Duplicate message prevention
- Premium console output
- Colored & formatted logs

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

### 3. Configure Environment (Optional)

You can set these environment variables:

```bash
# Bot Configuration
PREFIX=!                           # Command prefix
BOT_ADMINS=user_id1,user_id2      # Comma-separated admin user IDs
DEVELOPER_ID=your_user_id         # Bot developer user ID

# Rate Limiting
MESSAGE_DELAY_MS=2000             # Delay between messages
COMMAND_COOLDOWN_MS=3000          # Global command cooldown
POLLING_INTERVAL_MS=5000          # Message polling interval

# System
LOG_LEVEL=info                    # Logging level (info, debug, error)
AUTO_RECONNECT=true               # Auto-reconnect on failure
MAX_RECONNECT_ATTEMPTS=5          # Maximum reconnection attempts
```

### 4. Run the Bot

```bash
node index.js
```

## 📚 Built-in Commands

### General Commands (Role 0 - All Users)

#### Information & Utility
- `!help [command]` - Show all available commands or get help for specific command
- `!ping` - Check bot response time and uptime
- `!info` - Show comprehensive bot information
- `!credits` - Show bot credits and author information

#### Instagram Features
- `!uid [username]` - Get Instagram User ID from username
- `!userinfo <username>` - Get detailed Instagram user information and statistics

#### Fun & Entertainment
- `!quote` - Get a random inspirational quote
- `!joke` - Get a random joke to lighten the mood
- `!echo <message>` - Repeat your message

#### Utilities
- `!calc <expression>` - Calculate mathematical expressions
- `!time [timezone]` - Get current time in different timezones
- `!coinflip` - Flip a coin (Heads or Tails)
- `!dice [sides]` - Roll a dice (default 6-sided, or custom)
- `!choose <option1> | <option2> | ...` - Randomly choose from given options

### Admin Commands (Role 1 - Bot Admins)
- `!admin [add|remove|list] [user_id]` - Manage bot administrators

### Developer Commands (Role 3 - Bot Developer)
- `!dev` - Access developer control panel with system information

## 🔧 Creating Custom Commands

Create a new file in the `commands/` directory:

```javascript
export default {
  config: {
    name: 'commandname',
    aliases: ['alias1', 'alias2'],
    description: 'Command description',
    usage: 'commandname [args]',
    cooldown: 5,        // Seconds
    role: 0,            // 0=All, 1=Admin, 2=Group Admin, 3=Developer
    author: 'NeoKEX'    // Keep author credit!
  },

  async run({ api, event, args, bot }) {
    // Send text message
    await api.sendMessage('Response', event.threadId);
    
    // Send photo
    await api.sendPhoto('./path/to/image.jpg', event.threadId, 'Caption');
    
    // Send video
    await api.sendVideo('./path/to/video.mp4', event.threadId, 'Caption');
    
    // Send audio
    await api.sendAudio('./path/to/audio.mp3', event.threadId);
  }
};
```

**⚠️ IMPORTANT:** Always keep the `author: 'NeoKEX'` field in your commands!

## 🎯 Creating Custom Events

Create a new file in the `events/` directory:

```javascript
export default {
  config: {
    name: 'eventname',
    description: 'Event description'
  },

  async run(bot, data) {
    // Event handling logic
    const { api, commandLoader, eventLoader } = bot;
    
    // Your custom event code here
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

## 📄 License

MIT License - See LICENSE file for details

## 💎 Credits

**Created by:** NeoKEX  
**GitHub:** https://github.com/NeoKEX  
**Version:** 1.0.0

### Special Thanks
- All supporters and contributors
- Open source community
- Instagram bot developers

## ⚠️ Disclaimer

This bot is for educational purposes only. Instagram's Terms of Service prohibit automated access to their platform. Using this bot may result in your Instagram account being banned or restricted. Use at your own risk.

**The creator is not responsible for any misuse or account bans.**

## 🤝 Support

- 🐛 **Bug Reports:** Open an issue on GitHub
- 💡 **Feature Requests:** Open a discussion on GitHub
- 📧 **Contact:** Through GitHub profile
- ⭐ **Like this project?** Star it on GitHub!

## ⚖️ Copyright Notice

Copyright © 2025 NeoKEX. All rights reserved.

**This bot and its code are protected by copyright law.** Unauthorized copying, distribution, or modification of this software without permission is strictly prohibited and may result in legal action.

**DO NOT REMOVE OR MODIFY THE CREDITS!**

---

Made with ❤️ by **NeoKEX**
