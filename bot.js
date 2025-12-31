const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
const crypto = require("crypto");
const { RSI, EMA, MACD, BollingerBands } = require("technicalindicators");

/* ================= KONFIG ================= */

const BOT_TOKEN = "8275170048:AAHtG2UvG3KiBdKX7dIfivxWuk1EOiNpX0s";
const CHAT_ID = -1003310381850; // tvoje skupina

const BYBIT_API_KEY = "9RJmc0mm0GRjA8YQbK";
const BYBIT_API_SECRET = "sPOAoHzlp8Wxc7E9fCD2mzqfx1gr9U75hOYz";

const LEVERAGE = 5;        // připraveno do budoucna
const RISK_MODE = "PAPER"; // PAPER | LIVE

const TIMEFRAMES = ["5", "15", "60"]; // minuty

/* ========================================== */

const bot = new TelegramBot(BOT_TOKEN, { polling: false });

const client = axios.create({
  baseURL: "https://api.bybit.com",
  timeout: 10000
});

/* ================= BYBIT ================= */

async function getSymbols() {
  const res = await client.get("/v5/market/instruments-info", {
    params: { category: "linear" }
  });
  return res.data.result.list
    .filter(s => s.symbol.endsWith("USDT"))
    .map(s => s.symbol);
}

async function getKlines(symbol, interval) {
  const res = await client.get("/v5/market/kline", {
    params: {
      category: "linear",
      symbol,
      interval,
      limit: 100
    }
  });
  return res.data.result.list
    .reverse()
    .map(c => parseFloat(c[4])); // close
}

/* ================= ANALÝZA ================= */

function analyze(closes) {
  if (closes.length < 50) return null;

  const rsi = RSI.calculate({ values: closes, period: 14 }).slice(-1)[0];
  const emaFast = EMA.calculate({ values: closes, period: 9 }).slice(-1)[0];
  const emaSlow = EMA.calculate({ values: closes, period: 21 }).slice(-1)[0];
  const macd = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9
  }).slice(-1)[0];

  const bb = BollingerBands.calculate({
    values: closes,
    period: 20,
    stdDev: 2
  }).slice(-1)[0];

  const price = closes.at(-1);

  if (
    rsi < 30 &&
    emaFast > emaSlow &&
    price < bb.lower
  ) return "BUY";

  if (
    rsi > 70 &&
    emaFast < emaSlow &&
    price > bb.upper
  ) return "SELL";

  return null;
}

/* ================= SCANNER ================= */

async function scan() {
  console.log("🔍 Scan start");
  const symbols = await getSymbols();

  for (const symbol of symbols) {
    for (const tf of TIMEFRAMES) {
      try {
        const closes = await getKlines(symbol, tf);
        const signal = analyze(closes);

        if (signal) {
          const msg =
`📊 ${symbol}
⏱ TF: ${tf}m
📌 SIGNAL: ${signal}
⚙ Mode: ${RISK_MODE}
⚖ Leverage: ${LEVERAGE}x`;

          await bot.sendMessage(CHAT_ID, msg);
          console.log("ALERT:", symbol, tf, signal);
        }
      } catch (e) {
        console.log("Skip:", symbol, tf);
      }
    }
  }

  console.log("✅ Scan hotovo");
}

/* ================= LOOP ================= */

scan();
setInterval(scan, 5 * 60 * 1000); // každých 5 minut