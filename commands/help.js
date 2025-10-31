const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: 'help',
    aliases: ['h', 'commands', 'menu'],
    description: 'Show all available commands',
    usage: 'help [command]',
    cooldown: 3,
    role: 0,
    author: 'NeoKEX',
    category: 'system'
  },

  async run({ api, event, args, bot, logger, config }) {
    try {
      const { commandLoader } = bot;
      const prefix = config.PREFIX;
      const allCommands = commandLoader.commands;
      const categories = {};

      const emojiMap = {
        system: "⚙️",
        fun: "🎮",
        utility: "🛠️",
        admin: "👑",
        info: "ℹ️",
        game: "🎲",
        tools: "🔧",
        moderation: "🛡️",
        entertainment: "🎭",
        others: "📦"
      };

      const cleanCategoryName = (text) => {
        if (!text) return "others";
        return text
          .normalize("NFKD")
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();
      };

      // Group commands by category
      const uniqueCommands = new Set();
      for (const [name, cmd] of allCommands) {
        // Only add main command name, not aliases
        if (cmd.config.name === name) {
          const cat = cleanCategoryName(cmd.config.category);
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(cmd.config.name);
          uniqueCommands.add(cmd.config.name);
        }
      }

      // Single command detail
      if (args.length > 0) {
        const query = args[0].toLowerCase();
        const command = commandLoader.getCommand(query);

        if (!command) {
          return api.sendMessage(`❌ Command "${query}" not found.`, event.threadId);
        }

        const {
          name,
          author,
          usage,
          category,
          description,
          aliases,
          cooldown,
          role
        } = command.config;

        const roleNames = ['Everyone', 'Admin', 'Moderator', 'Developer'];
        const roleName = roleNames[role] || 'Everyone';

        let helpText = `☠️ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢 ☠️\n\n`;
        helpText += `➥ Name: ${name}\n`;
        helpText += `➥ Category: ${category || 'Uncategorized'}\n`;
        helpText += `➥ Description: ${description || 'No description'}\n`;
        helpText += `➥ Aliases: ${aliases?.length ? aliases.join(', ') : 'None'}\n`;
        helpText += `➥ Usage: ${prefix}${usage || name}\n`;
        helpText += `➥ Cooldown: ${cooldown || 0}s\n`;
        helpText += `➥ Required Role: ${roleName}\n`;
        helpText += `➥ Author: ${author || 'Unknown'}`;

        return api.sendMessage(helpText, event.threadId);
      }

      // Format all commands
      const formatCommands = (cmds) =>
        cmds.sort().map((cmd) => `│ ∘ ${cmd}`).join("\n");

      let msg = `╭━ 🎯 𝑪𝑶𝑴𝑴𝑨𝑵𝑫𝑺 ━╮\n`;
      msg += `│ Bot: ${config.BOT_NAME}\n`;
      msg += `│ Prefix: ${prefix}\n`;
      msg += `│ Total: ${uniqueCommands.size} commands\n`;
      
      const sortedCategories = Object.keys(categories).sort();
      for (const cat of sortedCategories) {
        const emoji = emojiMap[cat] || "➥";
        msg += `\n${emoji} ${cat.toUpperCase()}\n`;
        msg += `${formatCommands(categories[cat])}\n`;
      }
      
      msg += `\n╰➤ Use: ${prefix}help [command] for details`;

      return api.sendMessage(msg, event.threadId);

    } catch (error) {
      logger.error('Error in help command', { error: error.message, stack: error.stack });
      return api.sendMessage('Error displaying help information.', event.threadId);
    }
  }
};
