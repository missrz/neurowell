// services/geminiChat.js
const systemPrompt = require("../prompts/systemPrompt")
const ChatMessage = require("../models/ChatMessage")
const geminiClient = require('./geminiClient');

// chatWithGemini now accepts an optional `apiKey` to support per-call keys
// It delegates key rotation, metrics, and fallbacks to `geminiClient.runPrompt`
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

  // 4️⃣ Delegate to geminiClient which handles keys, metrics and python fallback.
  const { reply, usedKeyLabel } = await geminiClient.runPrompt({ prompt: finalPrompt, apiKey });

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
