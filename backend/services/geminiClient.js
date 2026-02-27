const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const apiKeyService = require('./apiKeyService');
const metrics = require('../utils/metrics');

function sleep(ms){ return new Promise(res => setTimeout(res, ms)); }

const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:4001';

async function tryWithKey(key, prompt) {
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  // result.response.text() follows existing usage in repo
  return result.response.text();
}

// Runs the provided prompt through Gemini, attempting up to 5 DB keys, optional single key, env fallback,
// and finally falling back to the Python AI server if all Gemini attempts fail.
// Returns: { reply: string, usedKeyLabel: string }
async function runPrompt({ prompt, apiKey = null }) {
  let reply = null;
  let usedKeyId = null;

  if (apiKey) {
    try {
      metrics.increment('gemini.attempts', 1, { mode: 'single' });
      reply = await tryWithKey(apiKey, prompt);
      metrics.increment('gemini.success', 1, { mode: 'single' });
      usedKeyId = 'provided';
    } catch (e) {
      metrics.increment('gemini.failures', 1, { mode: 'single' });
      console.warn('geminiClient: provided apiKey failed:', e.message || e);
      reply = null;
    }
  } else {
    try {
      const candidates = await apiKeyService.getActiveKeys('gemini', 5);
      for (let i = 0; i < candidates.length; i++) {
        const cand = candidates[i];
        const attemptIdx = i + 1;
        try {
          metrics.increment('gemini.attempts', 1, { keyId: String(cand.id), attempt: attemptIdx });
          reply = await tryWithKey(cand.key, prompt);
          usedKeyId = cand.id;
          metrics.increment('gemini.success', 1, { keyId: String(cand.id) });
          apiKeyService.touchLastUsed(cand.id).catch(() => {});
          break;
        } catch (innerErr) {
          metrics.increment('gemini.failures', 1, { keyId: String(cand.id) });
          console.warn('geminiClient: key attempt failed for', String(cand.id), innerErr.message || innerErr);
          reply = null;
          const backoffMs = Math.min(200 * Math.pow(2, i), 2000);
          const jitter = Math.floor(Math.random() * 100);
          await sleep(backoffMs + jitter);
          continue;
        }
      }
    } catch (e) {
      console.warn('geminiClient: failed to fetch candidate keys:', e.message || e);
    }
  }

  // env var fallback
  if (!reply) {
    try {
      const fallbackKey = process.env.GEMINI_API_KEY;
      if (fallbackKey) {
        metrics.increment('gemini.attempts', 1, { mode: 'env-fallback' });
        reply = await tryWithKey(fallbackKey, prompt);
        metrics.increment('gemini.success', 1, { mode: 'env-fallback' });
        usedKeyId = 'env';
      }
    } catch (e) {
      metrics.increment('gemini.failures', 1, { mode: 'env-fallback' });
      console.error('geminiClient: env var fallback failed:', e.message || e);
      reply = null;
    }
  }

  // If still no reply, fallback to Python AI server
  if (!reply) {
    try {
      metrics.increment('gemini.fallbacks', 1, { to: 'python_ai' });
      const url = `${AI_SERVER_URL.replace(/\/$/, '')}/chat`;
      const resp = await axios.post(url, { query: prompt }, { timeout: 20000 });
      // Python /chat returns { answer: <...> }
      const answer = resp?.data?.answer;
      if (answer != null) {
        // if answer is object with 'answer' nested, try to stringify
        reply = typeof answer === 'string' ? answer : JSON.stringify(answer);
        usedKeyId = 'python_fallback';
        console.info('geminiClient: falling back to Python AI server for prompt');
      } else {
        // Last resort: if resp.data itself is string or object
        reply = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
        usedKeyId = 'python_fallback';
      }
    } catch (e) {
      console.error('geminiClient: python AI fallback failed:', e.message || e);
      throw e;
    }
  }

  const usedKeyLabel = usedKeyId ? (typeof usedKeyId === 'string' ? usedKeyId : `keyId=${usedKeyId}`) : 'none';
  console.info(`geminiClient: successful key -> ${usedKeyLabel}`);
  return { reply, usedKeyLabel };
}

module.exports = { runPrompt };
