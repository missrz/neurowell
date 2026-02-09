// services/geminiChat.js
const { GoogleGenerativeAI } = require("@google/generative-ai")
const systemPrompt = require("../prompts/systemPrompt")
const ChatMessage = require("../models/ChatMessage")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

async function chatWithGemini({ userId, message }) {
  // 1️⃣ Fetch last messages (keep it small)
  const history = await ChatMessage.find({ userId })
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

  // 4️⃣ Call Gemini
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" })

  const result = await model.generateContent(finalPrompt)
  const reply = result.response.text()

  // 5️⃣ Save messages
  await ChatMessage.create([
    { role: "user", content: message, userId },
    { role: "assistant", content: reply, userId }
  ])

  return reply
}

module.exports = chatWithGemini
