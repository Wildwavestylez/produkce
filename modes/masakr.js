// modes/masakr.js

const { getSymbols, getCloses } = require("../bybit/market");
const { paperTrade } = require("../paper/simulator");
const rsi = require("../strategies/rsi");

const TIMEFRAMES = ["1", "5", "15"];

async function start(simulator) {   // <- přidáno
  const symbols = await getSymbols();

  for (const symbol of symbols) {
    for (const tf of TIMEFRAMES) {
      const closes = await getCloses(symbol, tf);
      const result = rsi.analyze(closes);

      if (result) {
        simulator.paperTrade({
          symbol,
          tf,
          strategy: result.strategy,
          side: result.signal,
          price: result.price
        });

        console.log(`🧪 ${symbol} ${tf}m | ${result.strategy} | ${result.signal}`);
      }
    }
  }
}

module.exports = { start };  // <- exportujeme start