const TelegramBot = require("node-telegram-bot-api");

// tvůj token a chat ID
const BOT_TOKEN = "8030561920:AAG4-f_SWSNQQ8O11CjnhsJdEUnmVZev7k";
const CHAT_ID = -5154393188;

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