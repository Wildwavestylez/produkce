const TelegramBot = require("node-telegram-bot-api");

// tvůj token a chat ID
const BOT_TOKEN = "8275170048:AAHtG2UvG3KiBdKX7dIfivxWuk1EOiNpX0s";
const CHAT_ID = -1003310381850;

// vytvoření bota s bezpečnějším timeoutem
const bot = new TelegramBot(BOT_TOKEN, {
  polling: false,
  request: { timeout: 10000 }
});

// odeslání zprávy
bot.sendMessage(CHAT_ID, "Bot je naživu. GitHub zije.")
  .then(() => {
    console.log("Zprava odeslana");
  })
  .catch((err) => {
    console.error("Chyba:", err.message);
  });