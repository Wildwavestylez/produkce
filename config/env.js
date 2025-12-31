// config/env.js

module.exports = {
  MODE: "PAPER", // PAPER | LIVE

  BYBIT: {
    API_KEY: "TVŮJ_API_KEY",
    API_SECRET: "TVŮJ_API_SECRET",
    BASE_URL: "https://api.bybit.com",
    RECV_WINDOW: "5000"
  },

  LOOP_INTERVAL_MS: 5 * 60 * 1000 // 5 minut
};