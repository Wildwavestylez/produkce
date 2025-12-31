const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
const crypto = require("crypto");
const { RSI, EMA, MACD, BollingerBands } = require("technicalindicators");

/* ================= KONFIG ================= */

const BOT_TOKEN = "8275170048:AAHtG2UvG3KiBdKX7dIfivxWuk1EOiNpX0s";
const CHAT_ID = -1003310381850; // tvoje skupina

const BYBIT_API_KEY = "9RJmc0mm0GRjA8YQbK";
const BYBIT_API_SECRET = "sPOAoHzlp8Wxc7E9fCD2mzqfx1gr9U75hOYz";

const RISK_MODE = "LIVE";
const LEVERAGE = 10;
const MARGIN_PER_TRADE = 30; // USDT
const TIMEFRAMES = ["5", "15", "60"]; // minuty
const activeTrades = new Set();
const COOLDOWN_MS = 15 * 60 * 1000; // 15 minut
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

async function placeOrder(symbol, side) {
  const timestamp = Date.now().toString();

  const body = {
    category: "linear",
    symbol,
    side: side === "BUY" ? "Buy" : "Sell",
    orderType: "Market",
    qty: MARGIN_PER_TRADE * LEVERAGE,
    timeInForce: "IOC"
  };

  const payload = timestamp + BYBIT_API_KEY + JSON.stringify(body);
  const signature = crypto
    .createHmac("sha256", BYBIT_API_SECRET)
    .update(payload)
    .digest("hex");

  const res = await axios.post(
    "https://api.bybit.com/v5/order/create",
    body,
    {
      headers: {
        "X-BAPI-API-KEY": BYBIT_API_KEY,
        "X-BAPI-SIGN": signature,
        "X-BAPI-TIMESTAMP": timestamp,
        "Content-Type": "application/json"
      }
    }
  );

  return res.data;
}

/* ================= SCANNER ================= */

async function scan() {
  console.log("🔍 Scan start");

  let symbols;
  try {
    symbols = await getSymbols();
  } catch (e) {
    console.log("❌ Nelze načíst symboly");
    return;
  }

  for (const symbol of symbols) {

    if (activeTrades.has(symbol)) continue;

    for (const tf of TIMEFRAMES) {
      try {
        const closes = await getKlines(symbol, tf);
        const signal = analyze(closes);

        if (!signal) continue;

        const message =
`📊 ${symbol}
⏱ TF: ${tf}m
📌 SIGNAL: ${signal}
⚙ Mode: ${RISK_MODE}
⚖ Leverage: ${LEVERAGE}x`;

        await bot.sendMessage(CHAT_ID, message);

        if (RISK_MODE === "LIVE") {
          try {
            await placeOrder(symbol, signal);
            activeTrades.add(symbol);

            await bot.sendMessage(
              CHAT_ID,
              `🚀 OBCHOD OTEVŘEN
${symbol}
Směr: ${signal}`
            );

            setTimeout(() => {
              activeTrades.delete(symbol);
            }, COOLDOWN_MS);

          } catch (orderErr) {
            await bot.sendMessage(
              CHAT_ID,
              `❌ CHYBA PŘI OBCHODU
${symbol}`
            );
            console.log("Order error:", orderErr.message);
          }
        }

        break; // po signálu už neřeší další TF
      } catch (e) {
        continue;
      }
    }
  }

  console.log("✅ Scan hotovo");
}
/* ================= LOOP ================= */

scan();
setInterval(scan, 5 * 60 * 1000); // každých 5 minut