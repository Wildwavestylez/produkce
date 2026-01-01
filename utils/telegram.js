// utils/telegram.js
// kompatibilní s existujícím notifier.js (BOT_TOKEN + CHAT_ID)

const axios = require("axios");
const { BOT_TOKEN, CHAT_ID } = require("../telegram/notifier");

module.exports = async function sendTelegram(text) {
  try {
    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text,
        parse_mode: "Markdown"
      }
    );
  } catch (e) {
    console.error("Telegram error:", e.message);
  }
};