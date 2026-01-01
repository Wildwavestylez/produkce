console.log('🚀 Starting BYBIT PORTFOLIO BOT (PAPER MODE)')

// ====== BASIC CHECKS ======
if (!process.env.TELEGRAM_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
  console.error('❌ Telegram config missing')
  process.exit(1)
}

console.log('✅ Env loaded')

// ====== LOAD MODULES ======
const masakrMode = require('./modes/masakr')
const simulator = require('./paper/simulator')
const sendTelegram = require('./utils/telegram')

console.log('✅ Modules loaded')

// ====== START BOT ======
async function start() {
  try {
    console.log('🧠 Initializing MASAKR MODE')

    await simulator.init({
      balance: 1000,
      riskPerTrade: 0.01,
      mode: 'paper'
    })

    await masakrMode.start(simulator)

    await sendTelegram(`
🤖 *BYBIT PORTFOLIO BOT STARTED*
Mode: *PAPER*
Strategy: *MASAKR*
Balance: *1000 USDT*

✅ All systems loaded
⏱ Waiting for signals...
    `)

    console.log('✅ Bot running')
  } catch (err) {
    console.error('🔥 START ERROR:', err)

    await sendTelegram(`
🔥 *BOT START FAILED*
Error:
${err.message}
    `)

    process.exit(1)
  }
}

start()