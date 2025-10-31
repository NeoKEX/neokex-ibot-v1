module.exports = {
  config: {
    name: 'time',
    aliases: ['clock', 'datetime', 'worldtime'],
    description: 'Get current time in different timezones',
    usage: 'time [timezone]\n\nExamples:\n  time - Current server time\n  time UTC\n  time America/New_York\n  time Asia/Tokyo',
    cooldown: 3,
    role: 0,
    author: 'NeoKEX'
  },

  async run({ api, event, args }) {
    try {
      const timezones = {
        'UTC': 'UTC',
        'GMT': 'GMT',
        'EST': 'America/New_York',
        'PST': 'America/Los_Angeles',
        'CST': 'America/Chicago',
        'MST': 'America/Denver',
        'JST': 'Asia/Tokyo',
        'KST': 'Asia/Seoul',
        'IST': 'Asia/Kolkata',
        'CET': 'Europe/Paris',
        'AEST': 'Australia/Sydney',
        'NZST': 'Pacific/Auckland',
        'PHT': 'Asia/Manila',
        'SGT': 'Asia/Singapore',
        'HKT': 'Asia/Hong_Kong'
      };

      if (args.length === 0) {
        const now = new Date();
        const dateStr = now.toDateString();
        const timeStr = now.toTimeString().split(' ')[0];
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        let message = `🕐 Current Time\n\n`;
        message += `📅 Date: ${dateStr}\n`;
        message += `⏰ Time: ${timeStr}\n`;
        message += `🌍 Timezone: ${timezone}\n\n`;
        message += `Use "time <timezone>" to check other timezones\n`;
        message += `Example: time UTC, time JST, time EST`;

        return api.sendMessage(message, event.threadId);
      }

      const requestedTz = args[0].toUpperCase();
      const timezone = timezones[requestedTz] || args.join('_');

      try {
        const now = new Date();
        const options = {
          timeZone: timezone,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        };

        const formatter = new Intl.DateTimeFormat('en-US', options);
        const formattedTime = formatter.format(now);

        const message = `🕐 Time in ${requestedTz || timezone}\n\n${formattedTime}`;

        return api.sendMessage(message, event.threadId);
      } catch (tzError) {
        return api.sendMessage(
          `❌ Invalid timezone: ${args[0]}\n\n` +
          'Available timezones:\n' +
          Object.keys(timezones).join(', ') +
          '\n\nOr use standard timezone format (e.g., Asia/Tokyo)',
          event.threadId
        );
      }
    } catch (error) {

      return api.sendMessage('Error getting time information.', event.threadId);
    }
  }
};
