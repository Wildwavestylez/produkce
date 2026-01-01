// paper/simulator.js

const fs = require("fs");
const path = require("path");

const LOG_PATH = path.join(__dirname, "../logs/trades.json");

function logTrade(trade) {
  let data = [];
  if (fs.existsSync(LOG_PATH)) {
    data = JSON.parse(fs.readFileSync(LOG_PATH));
  }

  data.push(trade);
  fs.writeFileSync(LOG_PATH, JSON.stringify(data, null, 2));
}

function paperTrade({ symbol, tf, strategy, side, price }) {
  const tp = price * (side === "BUY" ? 1.003 : 0.997);
  const sl = price * (side === "BUY" ? 0.997 : 1.003);

  const exit = Math.random() > 0.5 ? tp : sl;
  const pnl = side === "BUY" ? exit - price : price - exit;

  logTrade({
    time: new Date().toISOString(),
    symbol,
    tf,
    strategy,
    side,
    entry: price,
    exit,
    pnl
  });
}

module.exports = { paperTrade };