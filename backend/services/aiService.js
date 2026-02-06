const axios = require('axios');

const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:4001';

async function scoreText(text) {
  if (!text) throw new Error('text is required');
  const url = `${AI_SERVER_URL.replace(/\/$/, '')}/score`;
  const resp = await axios.post(url, { text }, { timeout: 20000 });
  return resp.data; // { score, raw }
}

module.exports = { scoreText };
