export default {
  config: {
    name: 'uid',
    aliases: ['userid', 'getuid', 'id'],
    description: 'Get Instagram User ID from username',
    usage: 'uid [username]\n\nExamples:\n  uid - Get your own UID\n  uid instagram - Get UID of @instagram',
    cooldown: 5,
    role: 0,
    author: 'NeoKEX'
  },

  async run({ api, event, args, bot }) {
    try {
      // If no username provided, return sender's UID
      if (args.length === 0) {
        const senderUID = event.userId || event.senderID;
        
        if (!senderUID) {
          return api.sendMessage('❌ Could not determine your User ID.', event.threadId);
        }
        
        const message = `👤 Your User ID:\n\n🆔 ${senderUID}`;
        return api.sendMessage(message, event.threadId);
      }
      
      // Get username from arguments
      const username = args[0].replace('@', '').trim();
      
      if (!username) {
        return api.sendMessage('❌ Please provide a valid username!\n\nUsage: uid <username>', event.threadId);
      }
      
      // Send searching message
      await api.sendMessage(`🔍 Searching for user: @${username}...`, event.threadId);
      
      // Fetch user info by username
      try {
        const userInfo = await bot.ig.getUserInfoByUsername(username);
        
        if (!userInfo) {
          return api.sendMessage(`❌ User @${username} not found!`, event.threadId);
        }
        
        const userId = userInfo.pk || userInfo.id || userInfo.user_id;
        const fullName = userInfo.full_name || 'N/A';
        const isPrivate = userInfo.is_private ? '🔒 Private' : '🔓 Public';
        const isVerified = userInfo.is_verified ? '✅ Verified' : '';
        const followerCount = userInfo.follower_count ? userInfo.follower_count.toLocaleString() : 'N/A';
        const followingCount = userInfo.following_count ? userInfo.following_count.toLocaleString() : 'N/A';
        
        const message = `👤 User Information:\n\n` +
          `📝 Username: @${username}\n` +
          `🆔 User ID: ${userId}\n` +
          `👨‍💼 Full Name: ${fullName}\n` +
          `${isPrivate} ${isVerified}\n` +
          `👥 Followers: ${followerCount}\n` +
          `➡️ Following: ${followingCount}`;
        
        return api.sendMessage(message, event.threadId);
        
      } catch (searchError) {
        // If direct search fails, try searching users
        try {
          const searchResults = await bot.ig.searchUsers(username);
          
          if (!searchResults || searchResults.length === 0) {
            return api.sendMessage(`❌ User @${username} not found!`, event.threadId);
          }
          
          // Get the first match
          const user = searchResults[0];
          const userId = user.pk || user.id || user.user_id;
          const fullName = user.full_name || 'N/A';
          const actualUsername = user.username || username;
          const isPrivate = user.is_private ? '🔒 Private' : '🔓 Public';
          const isVerified = user.is_verified ? '✅ Verified' : '';
          
          let message = `👤 User Information:\n\n` +
            `📝 Username: @${actualUsername}\n` +
            `🆔 User ID: ${userId}\n` +
            `👨‍💼 Full Name: ${fullName}\n` +
            `${isPrivate} ${isVerified}`;
          
          // Add other matches if found
          if (searchResults.length > 1) {
            message += `\n\n💡 Found ${searchResults.length} matches. Showing first result.`;
          }
          
          return api.sendMessage(message, event.threadId);
          
        } catch (error2) {
          console.error('Error searching user:', error2);
          return api.sendMessage(
            `❌ Failed to find user @${username}\n\n` +
            `Possible reasons:\n` +
            `• User doesn't exist\n` +
            `• Username is incorrect\n` +
            `• Account is restricted\n\n` +
            `Error: ${error2.message}`,
            event.threadId
          );
        }
      }
      
    } catch (error) {
      console.error('Error in uid command:', error);
      return api.sendMessage(
        `❌ An error occurred while fetching user ID.\n\n` +
        `Error: ${error.message}`,
        event.threadId
      );
    }
  }
};
