export default {
  config: {
    name: 'userinfo',
    aliases: ['uinfo', 'profile', 'iginfo'],
    description: 'Get detailed Instagram user information',
    usage: 'userinfo <username>\n\nExamples:\n  userinfo instagram\n  userinfo cristiano',
    cooldown: 10,
    role: 0,
    author: 'NeoKEX'
  },

  async run({ api, event, args, bot }) {
    try {
      if (args.length === 0) {
        return api.sendMessage(
          '❌ Please provide a username!\n\n' +
          'Usage: userinfo <username>\n' +
          'Example: userinfo instagram',
          event.threadId
        );
      }

      const username = args[0].replace('@', '').trim();

      if (!username) {
        return api.sendMessage('❌ Please provide a valid username!', event.threadId);
      }

      await api.sendMessage(`🔍 Fetching detailed information for @${username}...`, event.threadId);

      try {
        const userInfo = await bot.ig.getUserInfoByUsername(username);

        if (!userInfo) {
          return api.sendMessage(`❌ User @${username} not found!`, event.threadId);
        }

        const userId = userInfo.pk || userInfo.id || userInfo.user_id;
        const fullName = userInfo.full_name || 'N/A';
        const biography = userInfo.biography || 'No bio';
        const isPrivate = userInfo.is_private ? '🔒 Private' : '🔓 Public';
        const isVerified = userInfo.is_verified ? '✅ Verified' : '❌ Not Verified';
        const isBusiness = userInfo.is_business ? '💼 Business Account' : '👤 Personal Account';
        const followerCount = userInfo.follower_count ? userInfo.follower_count.toLocaleString() : 'N/A';
        const followingCount = userInfo.following_count ? userInfo.following_count.toLocaleString() : 'N/A';
        const mediaCount = userInfo.media_count ? userInfo.media_count.toLocaleString() : 'N/A';
        const externalUrl = userInfo.external_url || 'None';
        const category = userInfo.category || 'N/A';

        let message = `╔═══════════════════════════════════╗\n`;
        message += `║      INSTAGRAM USER INFO          ║\n`;
        message += `╚═══════════════════════════════════╝\n\n`;
        message += `👤 Username: @${username}\n`;
        message += `🆔 User ID: ${userId}\n`;
        message += `📝 Full Name: ${fullName}\n`;
        message += `${isPrivate}\n`;
        message += `${isVerified}\n`;
        message += `${isBusiness}\n\n`;
        message += `📊 Statistics:\n`;
        message += `  • Posts: ${mediaCount}\n`;
        message += `  • Followers: ${followerCount}\n`;
        message += `  • Following: ${followingCount}\n\n`;
        message += `📖 Biography:\n${biography}\n\n`;
        
        if (externalUrl !== 'None') {
          message += `🔗 Website: ${externalUrl}\n\n`;
        }
        
        if (category !== 'N/A') {
          message += `🏷️ Category: ${category}\n\n`;
        }
        
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `Profile: https://instagram.com/${username}`;

        return api.sendMessage(message, event.threadId);

      } catch (searchError) {
  
        return api.sendMessage(
          `❌ Error fetching user information for @${username}\n\n` +
          'This could be due to:\n' +
          '• User not found\n' +
          '• Account is private\n' +
          '• Instagram API rate limit\n' +
          '• Network error',
          event.threadId
        );
      }

    } catch (error) {

      return api.sendMessage('Error executing userinfo command.', event.threadId);
    }
  }
};
