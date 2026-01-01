// strategies/rsi.js

const { RSI } = require("technicalindicators");

function analyze(closes) {
  if (closes.length < 20) return null;

  const rsi = RSI.calculate({ values: closes, period: 14 }).at(-1);
  const price = closes.at(-1);

  if (rsi < 30) {
    return { signal: "BUY", strategy: "RSI_OVERSOLD", price };
  }

  if (rsi > 70) {
    return { signal: "SELL", strategy: "RSI_OVERBOUGHT", price };
  }

  return null;
}

module.exports = { analyze };