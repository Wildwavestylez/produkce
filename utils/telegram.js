const axios = require('axios')

module.exports = async function sendTelegram(text) {
  try {
    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown'
      }
    )
  } catch (e) {
    console.error('Telegram error:', e.message)
  }
}