// bybit/market.js

const { publicGet } = require("./client");

async function getSymbols() {
  const res = await publicGet("/v5/market/instruments-info", {
    category: "linear"
  });

  return res.data.result.list
    .filter(s => s.symbol.endsWith("USDT"))
    .map(s => s.symbol);
}

async function getCloses(symbol, interval, limit = 100) {
  const res = await publicGet("/v5/market/kline", {
    category: "linear",
    symbol,
    interval,
    limit
  });

  return res.data.result.list
    .reverse()
    .map(c => parseFloat(c[4])); // close
}

module.exports = {
  getSymbols,
  getCloses
};