export default {
  config: {
    name: 'joke',
    aliases: ['j', 'funny', 'laugh'],
    description: 'Get a random joke',
    usage: 'joke',
    cooldown: 5,
    role: 0,
    author: 'NeoKEX'
  },

  async run({ api, event }) {
    try {
      const jokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "Why did the scarecrow win an award? He was outstanding in his field!",
        "Why don't eggs tell jokes? They'd crack each other up!",
        "What do you call a fake noodle? An impasta!",
        "Why did the bicycle fall over? Because it was two tired!",
        "What do you call a bear with no teeth? A gummy bear!",
        "Why did the math book look so sad? Because it had too many problems!",
        "What do you call a fish with no eyes? Fsh!",
        "Why can't you hear a pterodactyl go to the bathroom? Because the 'P' is silent!",
        "What did the ocean say to the beach? Nothing, it just waved!",
        "Why do programmers prefer dark mode? Because light attracts bugs!",
        "How do you organize a space party? You planet!",
        "Why don't skeletons fight each other? They don't have the guts!",
        "What's orange and sounds like a parrot? A carrot!",
        "Why did the coffee file a police report? It got mugged!",
        "What do you call a dinosaur that crashes his car? Tyrannosaurus Wrecks!",
        "Why couldn't the bicycle stand up by itself? It was two tired!",
        "What do you call a sleeping bull? A bulldozer!",
        "Why did the golfer bring two pairs of pants? In case he got a hole in one!",
        "What do you call a can opener that doesn't work? A can't opener!",
        "Why don't programmers like nature? It has too many bugs!",
        "What did one wall say to the other wall? I'll meet you at the corner!",
        "Why did the tomato turn red? Because it saw the salad dressing!",
        "What do you call a boomerang that doesn't come back? A stick!",
        "Why did the cookie go to the doctor? Because it felt crumbly!"
      ];

      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

      const message = `😂 Here's a joke for you:\n\n${randomJoke}`;

      return api.sendMessage(message, event.threadId);
    } catch (error) {
      console.error('Error in joke command:', error);
      return api.sendMessage('Error fetching joke.', event.threadId);
    }
  }
};
