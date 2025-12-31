// bot.js

const { MODE, LOOP_INTERVAL_MS } = require("./config/env");
const { publicGet } = require("./bybit/client");

async function testConnection() {
  try {
    const res = await publicGet("/v5/market/time");
    console.log("🟢 Bybit time OK:", res.data.result.timeSecond);
  } catch (err) {
    console.error("🔴 Bybit connection FAILED");
  }
}


// bot.js

const { sendMessage } = require("./telegram/notifier");

async function loop() {
  console.log("🔄 Bot loop start | MODE:", MODE);
  await testConnection();

  // TEST zpráva do Telegramu
  await sendMessage("🟢 Bot je online | Mode: " + MODE);

  console.log("✅ Loop hotovo");
}

// start
loop();
setInterval(loop, LOOP_INTERVAL_MS);