import config from '../config.js';

class Banner {
  static display() {
    const banner = `
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   ███╗   ██╗███████╗ ██████╗ ██╗  ██╗███████╗██╗  ██╗           ║
║   ████╗  ██║██╔════╝██╔═══██╗██║ ██╔╝██╔════╝╚██╗██╔╝           ║
║   ██╔██╗ ██║█████╗  ██║   ██║█████╔╝ █████╗   ╚███╔╝            ║
║   ██║╚██╗██║██╔══╝  ██║   ██║██╔═██╗ ██╔══╝   ██╔██╗            ║
║   ██║ ╚████║███████╗╚██████╔╝██║  ██╗███████╗██╔╝ ██╗           ║
║   ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝           ║
║                                                                   ║
║              ██╗██████╗  ██████╗ ████████╗    ██╗   ██╗ ██╗      ║
║              ██║██╔══██╗██╔═══██╗╚══██╔══╝    ██║   ██║███║      ║
║              ██║██████╔╝██║   ██║   ██║       ██║   ██║╚██║      ║
║              ██║██╔══██╗██║   ██║   ██║       ╚██╗ ██╔╝ ██║      ║
║              ██║██████╔╝╚██████╔╝   ██║        ╚████╔╝  ██║      ║
║              ╚═╝╚═════╝  ╚═════╝    ╚═╝         ╚═══╝   ╚═╝      ║
║                                                                   ║
║═══════════════════════════════════════════════════════════════════║
║                                                                   ║
║  📦 Version: ${config.BOT_VERSION.padEnd(52)} ║
║  👤 Author:  ${config.AUTHOR.padEnd(52)} ║
║  🔗 GitHub:  ${config.GITHUB.padEnd(52)} ║
║                                                                   ║
║═══════════════════════════════════════════════════════════════════║
║                                                                   ║
║  ⚠️  WARNING: DO NOT REMOVE OR MODIFY CREDITS!                   ║
║                                                                   ║
║  🚫 Removing or changing the author credits will result in:       ║
║     • Immediate account ban from support                         ║
║     • Loss of access to future updates                           ║
║     • Public exposure of copyright violation                     ║
║                                                                   ║
║  ✅ Respect the original creator's work!                          ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
`;

    console.log('\x1b[36m%s\x1b[0m', banner);
  }

  static startupMessage(userID, username, commandCount, eventCount) {
    const message = `
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ✅ ${config.BOT_NAME} Started Successfully!                     
│                                                                │
│  📊 Bot Statistics:                                            │
│     • User ID:        ${(userID || 'Loading...').padEnd(42)} │
│     • Username:       ${(username || 'Loading...').padEnd(42)} │
│     • Commands:       ${String(commandCount).padEnd(42)} │
│     • Events:         ${String(eventCount).padEnd(42)} │
│     • Prefix:         ${config.PREFIX.padEnd(42)} │
│                                                                │
│  🎯 Bot is now listening for messages...                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
`;
    console.log('\x1b[32m%s\x1b[0m', message);
  }

  static commandExecuted(commandName, user, success = true) {
    const icon = success ? '✅' : '❌';
    const status = success ? 'SUCCESS' : 'FAILED';
    console.log(
      `\x1b[${success ? '32' : '31'}m[${icon} COMMAND ${status}]\x1b[0m ${commandName} | User: ${user}`
    );
  }

  static messageReceived(from, preview) {
    console.log(
      `\x1b[36m[📩 MESSAGE]\x1b[0m From: ${from} | Preview: ${preview.substring(0, 40)}...`
    );
  }

  static error(context, error) {
    console.log(
      `\x1b[31m[❌ ERROR]\x1b[0m ${context}: ${error}`
    );
  }

  static info(message) {
    console.log(
      `\x1b[34m[ℹ️  INFO]\x1b[0m ${message}`
    );
  }

  static warning(message) {
    console.log(
      `\x1b[33m[⚠️  WARNING]\x1b[0m ${message}`
    );
  }

  static success(message) {
    console.log(
      `\x1b[32m[✅ SUCCESS]\x1b[0m ${message}`
    );
  }
}

export default Banner;
