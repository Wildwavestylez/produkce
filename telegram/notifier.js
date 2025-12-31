// telegram/notifier.js

const TelegramBot = require("node-telegram-bot-api");
const { MODE } = require("../config/env");

// TVŮJ TELEGRAM BOT TOKEN
const BOT_TOKEN = "8275170048:AAHtG2UvG3KiBdKX7dIfivxWuk1EOiNpX0s";
// CHAT ID (skupina / kanál)
const CHAT_ID = "-1003310381850";

const bot = new TelegramBot(BOT_TOKEN, { polling: false });

async function sendMessage(message) {
  try {
    await bot.sendMessage(CHAT_ID, message, { parse_mode: "HTML" });
  } catch (err) {
    console.error("🔴 Telegram sendMessage failed:", err.message);
  }
}

module.exports = { sendMessage };