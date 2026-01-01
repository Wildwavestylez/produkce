// bot.js

console.log('🚀 Starting BYBIT PORTFOLIO BOT (PAPER MODE)')

// ====== LOAD MODULES ======
const masakrMode = require('./modes/masakr')
const simulator = require('./paper/simulator')
const sendTelegram = require('./utils/telegram')

console.log('✅ Modules loaded')


const fs = require("fs");
const path = require("path");

const STATE_PATH = path.join(__dirname, "public/state.json");

function updateState(data) {
  let state = {};
  try {
    state = JSON.parse(fs.readFileSync(STATE_PATH));
  } catch {}

  const newState = {
    ...state,
    ...data
  };

  fs.writeFileSync(STATE_PATH, JSON.stringify(newState, null, 2));
}

function log(msg) {
  let state = {};
  try {
    state = JSON.parse(fs.readFileSync(STATE_PATH));
  } catch {}

  state.logs = state.logs || [];
  state.logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);

  if (state.logs.length > 200) state.logs.shift();

  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

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
🤖 BYBIT PORTFOLIO BOT STARTED
Mode: PAPER
Strategy: MASAKR
Balance: 1000 USDT

✅ All systems loaded
⏱ Waiting for signals...
    `)

    console.log('✅ Bot running')
  } catch (err) {
    console.error('🔥 START ERROR:', err)

    await sendTelegram(`
🔥 BOT START FAILED
Error:
${err.message}
    `)

    process.exit(1)
  }
}

start()