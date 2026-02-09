const express = require('express');
const axios = require('axios');
const chatWithGemini = require("../services/geminiChat")
const auth = require("../middleware/authMiddleware");
const router = express.Router();

const AI_SERVER_URL = process.env.AI_SERVER_URL || "http://localhost:4001";

// POST /api/chat
// This route now only proxies requests to the AI service `/chat` endpoint.
// Accepts a body with either `{ query }` or `{ message }` and forwards it
// as-is to the AI server. Removes streaming and fallback attempts.
router.post('/', async (req, res) => {
  const body = req.body || {};
  // allow either `query` (from curl example) or `message` (frontend)
  const message = body.message || body.query;
  if (!message) return res.status(400).json({ error: 'message or query is required' });

  try {
    const r = await axios.post(`${AI_SERVER_URL}/chat`, body, { timeout: 60000 });
    return res.json(r.data);
  } catch (err) {
    console.error('Proxy to AI /chat failed:', err.message);
    if (err.response && err.response.data) {
      return res.status(err.response.status || 502).json({ error: 'ai error', details: err.response.data });
    }
    return res.status(502).json({ error: 'could not reach ai server' });
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
