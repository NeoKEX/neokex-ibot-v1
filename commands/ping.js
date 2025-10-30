export default {
  config: {
    name: 'ping',
    aliases: ['p'],
    description: 'Check bot response time',
    usage: 'ping',
    cooldown: 5,
    role: 0,
    author: 'NeoKEX'
  },

  async run({ api, event, bot }) {
    try {
      const startTime = Date.now();
      
      await api.sendMessage('🏓 Pinging...', event.threadId);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      
      const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;
      
      const message = `🏓 Pong!\n\nResponse Time: ${responseTime}ms\nUptime: ${uptimeStr}\nStatus: ✅ Online`;
      
      return api.sendMessage(message, event.threadId);
    } catch (error) {
      console.error('Error in ping command:', error);
      return api.sendMessage('Error executing ping command.', event.threadId);
    }
  }
};
