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

async function loop() {
  console.log("🔄 Bot loop start | MODE:", MODE);
  // zatím jen test spojení
  await testConnection();
  console.log("✅ Loop hotovo");
}

// start
loop();
setInterval(loop, LOOP_INTERVAL_MS);