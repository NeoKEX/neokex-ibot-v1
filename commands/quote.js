export default {
  config: {
    name: 'quote',
    aliases: ['q', 'inspiration', 'motivate'],
    description: 'Get a random inspirational quote',
    usage: 'quote',
    cooldown: 5,
    role: 0,
    author: 'NeoKEX'
  },

  async run({ api, event }) {
    try {
      const quotes = [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
        { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
        { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
        { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
        { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
        { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
        { text: "If life were predictable it would cease to be life, and be without flavor.", author: "Eleanor Roosevelt" },
        { text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa" },
        { text: "When you reach the end of your rope, tie a knot in it and hang on.", author: "Franklin D. Roosevelt" },
        { text: "Don't judge each day by the harvest you reap but by the seeds that you plant.", author: "Robert Louis Stevenson" },
        { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
        { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
        { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
        { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
        { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
        { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
        { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
        { text: "Act as if what you do makes a difference. It does.", author: "William James" },
        { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" }
      ];

      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

      const message = `💭 Inspirational Quote:\n\n"${randomQuote.text}"\n\n— ${randomQuote.author}`;

      return api.sendMessage(message, event.threadId);
    } catch (error) {
      console.error('Error in quote command:', error);
      return api.sendMessage('Error fetching quote.', event.threadId);
    }
  }
};
