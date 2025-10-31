const config = require('../config');

module.exports = {
  config: {
    name: 'help',
    aliases: ['h', 'commands'],
    description: 'Show all available commands',
    usage: 'help [command]',
    cooldown: 3,
    role: 0,
    author: 'NeoKEX'
  },

  async run({ api, event, args, bot }) {
    try {
      const { commandLoader } = bot;
      const prefix = config.PREFIX;

      if (args.length > 0) {
        // Show help for specific command
        const commandName = args[0].toLowerCase();
        const command = commandLoader.getCommand(commandName);

        if (!command) {
          return api.sendMessage(`Command "${commandName}" not found.`, event.threadId);
        }

        let helpText = `📖 Command: ${command.config.name}\n`;
        helpText += `Description: ${command.config.description || 'No description'}\n`;
        helpText += `Usage: ${prefix}${command.config.usage || command.config.name}\n`;
        
        if (command.config.aliases && command.config.aliases.length > 0) {
          helpText += `Aliases: ${command.config.aliases.join(', ')}\n`;
        }
        
        helpText += `Cooldown: ${command.config.cooldown || 0}s`;

        return api.sendMessage(helpText, event.threadId);
      }

      // Show all commands
      const commandNames = commandLoader.getAllCommandNames();
      
      let helpText = `📚 ${config.BOT_NAME} - Available Commands\n\n`;
      helpText += `Prefix: ${prefix}\n`;
      helpText += `Total Commands: ${commandNames.length}\n\n`;
      
      commandNames.forEach(name => {
        const cmd = commandLoader.getCommand(name);
        helpText += `${prefix}${name} - ${cmd.config.description || 'No description'}\n`;
      });
      
      helpText += `\nUse ${prefix}help <command> for detailed info`;

      return api.sendMessage(helpText, event.threadId);
    } catch (error) {

      return api.sendMessage('Error displaying help information.', event.threadId);
    }
  }
};
