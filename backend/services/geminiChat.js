// services/geminiChat.js
const { GoogleGenerativeAI } = require("@google/generative-ai")
const systemPrompt = require("../prompts/systemPrompt")
const ChatMessage = require("../models/ChatMessage")

const apiKeyService = require('./apiKeyService');
const metrics = require('../utils/metrics');

function sleep(ms){ return new Promise(res => setTimeout(res, ms)); }

// chatWithGemini now accepts an optional `apiKey` to support per-call keys
// If no `apiKey` provided, it will try up to 5 active keys from DB and fall back to the env var.
async function chatWithGemini({ userId, message, chatId, apiKey=null, saveToHistory = true, returnMeta = false }) {
  // 1️⃣ Fetch last messages (keep it small)
  // If chatId provided, fetch messages for that chat; otherwise fallback to userId
  const query = chatId ? { chatId } : { userId };
  const history = await ChatMessage.find(query)
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

  history.reverse()

  // 2️⃣ Build conversation text
  const conversation = history
    .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n")

  // 3️⃣ Final prompt
  const finalPrompt = `
    ${systemPrompt}

    Conversation so far:
    ${conversation}

    User: ${message}
    Assistant:
    `

  // 4️⃣ Call Gemini. If a single apiKey is provided, use it. Otherwise try up to 5 active keys from DB.
  let reply = null;
  let usedKeyId = null;

  const tryWithKey = async (key) => {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });
    const result = await model.generateContent(finalPrompt);
    return result.response.text();
  };

  if (apiKey) {
    try {
      metrics.increment('gemini.attempts', 1, { mode: 'single' });
      reply = await tryWithKey(apiKey);
      metrics.increment('gemini.success', 1, { mode: 'single' });
      usedKeyId = null;
    } catch (e) {
      metrics.increment('gemini.failures', 1, { mode: 'single' });
      console.warn('geminiChat: provided apiKey failed:', e.message || e);
      reply = null;
    }
  } else {
    // Get up to 5 active keys and try them in order with backoff
    try {
      const candidates = await apiKeyService.getActiveKeys('gemini', 5);
      for (let i = 0; i < candidates.length; i++) {
        const cand = candidates[i];
        const attemptIdx = i + 1;
        try {
          metrics.increment('gemini.attempts', 1, { keyId: String(cand.id), attempt: attemptIdx });
          reply = await tryWithKey(cand.key);
          usedKeyId = cand.id;
          metrics.increment('gemini.success', 1, { keyId: String(cand.id) });
          // mark last used (fire-and-forget)
          apiKeyService.touchLastUsed(cand.id).catch(() => {});
          break;
        } catch (innerErr) {
          metrics.increment('gemini.failures', 1, { keyId: String(cand.id) });
          console.warn('geminiChat: key attempt failed for', String(cand.id), innerErr.message || innerErr);
          reply = null;
          // Exponential backoff with jitter before next candidate
          const backoffMs = Math.min(200 * Math.pow(2, i), 2000);
          const jitter = Math.floor(Math.random() * 100);
          await sleep(backoffMs + jitter);
          continue;
        }
      }
    } catch (e) {
      console.warn('geminiChat: failed to fetch candidate keys:', e.message || e);
    }
  }

  // If still no reply, fall back to env var if available
  if (!reply) {
    try {
      const fallbackKey = process.env.GEMINI_API_KEY;
      if (fallbackKey) {
        metrics.increment('gemini.attempts', 1, { mode: 'env-fallback' });
        reply = await tryWithKey(fallbackKey);
        metrics.increment('gemini.success', 1, { mode: 'env-fallback' });
      }
    } catch (e) {
      metrics.increment('gemini.failures', 1, { mode: 'env-fallback' });
      console.error('geminiChat: env var fallback failed:', e.message || e);
      throw e;
    }
  }

  // Determine which key produced the successful reply (key id, 'provided', or 'env')
  let usedKeyLabel = null;
  try {
    usedKeyLabel = usedKeyId ? `keyId=${usedKeyId}` : (apiKey ? 'provided' : (process.env.GEMINI_API_KEY ? 'env' : 'none'));
    console.info(`geminiChat: successful key -> ${usedKeyLabel}`);
  } catch (e) {
    // non-fatal
  }

  // 5️⃣ Save messages (include chatId when present) — optional
  if (saveToHistory) {
    const userMsg = { role: 'user', content: message, userId };
    const assistantMsg = { role: 'assistant', content: reply, userId };
    if (chatId) {
      userMsg.chatId = chatId;
      assistantMsg.chatId = chatId;
    }
    await ChatMessage.create([userMsg, assistantMsg]);
  }

  if (returnMeta) return { reply, usedKeyLabel };
  return reply;
}

module.exports = chatWithGemini
