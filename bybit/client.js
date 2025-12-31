// bybit/client.js

const axios = require("axios");
const crypto = require("crypto");
const { BYBIT } = require("../config/env");

const client = axios.create({
  baseURL: BYBIT.BASE_URL,
  timeout: 10000
});

function signRequest(timestamp, body = "") {
  const payload =
    timestamp +
    BYBIT.API_KEY +
    BYBIT.RECV_WINDOW +
    body;

  return crypto
    .createHmac("sha256", BYBIT.API_SECRET)
    .update(payload)
    .digest("hex");
}

async function privatePost(path, body) {
  const timestamp = Date.now().toString();
  const bodyString = JSON.stringify(body);

  const signature = signRequest(timestamp, bodyString);

  return client.post(path, body, {
    headers: {
      "X-BAPI-API-KEY": BYBIT.API_KEY,
      "X-BAPI-SIGN": signature,
      "X-BAPI-TIMESTAMP": timestamp,
      "X-BAPI-RECV-WINDOW": BYBIT.RECV_WINDOW,
      "Content-Type": "application/json"
    }
  });
}

async function publicGet(path, params = {}) {
  return client.get(path, { params });
}

module.exports = {
  privatePost,
  publicGet
};