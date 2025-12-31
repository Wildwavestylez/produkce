const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

// ==== TELEGRAM ====
const BOT_TOKEN = "8275170048:AAHtG2UvG3KiBdKX7dIfivxWuk1EOiNpX0s";
const CHAT_ID = -1003310381850; // nové chat ID
const bot = new TelegramBot(BOT_TOKEN, { polling: false, request: { timeout: 10000 } });

// ==== BYBIT API ====
const BASE_URL = "https://api.bybit.com";

// TF, které chceme sledovat
const TIMEFRAMES = ["5", "15", "60"]; // minuty

// RSI funkce
function calculateRSI(closes, period = 14) {
  if (closes.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i-1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  let rs = gains / losses || 0;
  return 100 - 100 / (1 + rs);
}

// SMA funkce
function calculateSMA(closes, period = 20) {
  if (closes.length < period) return null;
  const sum = closes.slice(-period).reduce((a,b) => a+b, 0);
  return sum / period;
}

// ==== Hlavní loop ====
async function scanMarket() {
  try {
    // 1️⃣ Fetch trading symbols
    const resp = await axios.get(`${BASE_URL}/v2/public/symbols`);
    const symbols = resp.data.result.map(s => s.name); // např. BTCUSDT, ETHUSDT

    for (let symbol of symbols) {
      for (let tf of TIMEFRAMES) {
        // 2️⃣ Fetch historické svíčky
        const candles = await axios.get(`${BASE_URL}/v2/public/kline/list`, {
          params: { symbol, interval: tf, limit: 50 }
        });

        const closes = candles.data.result.map(c => parseFloat(c.close));

        // 3️⃣ Počítáme indikátory
        const rsi = calculateRSI(closes);
        const sma = calculateSMA(closes);

        // 4️⃣ Jednoduchá podmínka: RSI < 30 a cena nad SMA = buy signál
        const price = closes[closes.length - 1];
        if (rsi !== null && sma !== null && rsi < 30 && price > sma) {
          const msg = `📈 BUY signal\nPair: ${symbol}\nTF: ${tf}m\nPrice: ${price}\nRSI: ${rsi.toFixed(2)}\nSMA: ${sma.toFixed(2)}`;
          await bot.sendMessage(CHAT_ID, msg);
          console.log(msg);
        }
      }
    }
  } catch (err) {
    console.error("Chyba při skenování:", err.message);
  }
}

// Spouštíme každých 5 minut
scanMarket();
setInterval(scanMarket, 3*60*1000);