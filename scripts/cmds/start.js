module.exports = {
    config: {
        name: 'start',
        aliases: ['example','cat'], 
        category: 'general',
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Start the bot',
        usage: 'start'
    },

    onStart: async function({ msg, bot, config }) {
        const welcomeMessage = `Miw Meowww Welcome to ${config.botName} Bot Zone!`;
        bot.sendMessage(msg.chat.id, welcomeMessage, { replyToMessage: msg.message_id });
    }
};
