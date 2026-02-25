const express = require('express');
const axios = require('axios');
const chatWithGemini = require("../services/geminiChat")
const auth = require("../middleware/authMiddleware");
const router = express.Router();

const AI_SERVER_URL = process.env.AI_SERVER_URL || "http://localhost:4001";

// POST /api/chat
// Try Node-side Gemini (will attempt up to 5 DB keys), then fall back to Python AI server.
router.post('/', async (req, res) => {
  const body = req.body || {};
  const message = body.message || body.query;
  if (!message) return res.status(400).json({ error: 'message or query is required' });

  try {
    // Prefer Node-side Gemini which internally tries active keys (with backoff)
    const meta = await chatWithGemini({ message, chatId: body.chatId, userId: null, saveToHistory: true, returnMeta: true });
    const reply = meta?.reply ?? meta;
    const usedKeyLabel = meta?.usedKeyLabel || 'unknown';
    console.info(`routes/chat: gemini reply used -> ${usedKeyLabel}`);
    return res.json({ reply, meta: { usedKeyLabel } });
  } catch (err) {
    console.warn('routes/chat: Node geminiChat failed, falling back to Python AI:', err.message || err);
    // Proxy to Python AI service as a fallback
    try {
      const r = await axios.post(`${AI_SERVER_URL}/chat`, body, { timeout: 60000 });
      return res.json(r.data);
    } catch (err2) {
      console.error('Proxy to AI /chat failed:', err2.message || err2);
      if (err2.response && err2.response.data) {
        return res.status(err2.response.status || 502).json({ error: 'ai error', details: err2.response.data });
      }
      return res.status(502).json({ error: 'could not reach ai server' });
    }
  }
});

router.post("/send", auth, async (req, res) => {
  const { message } = req.body
  const userIdFromToken = req.user && req.user.id
  if (!message) return res.status(400).json({ error: "Message is required" })
  if (!userIdFromToken) return res.status(401).json({ error: "Unauthorized" })
  const reply = await chatWithGemini({ userId: userIdFromToken, message })

  res.json({ reply })
})

module.exports = router;
