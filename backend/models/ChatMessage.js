// models/ChatMessage.js
const mongoose = require("mongoose")

const ChatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true
    },
    content: String,
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
      chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: false }
    
  },
  { timestamps: true }
)

module.exports = mongoose.model("ChatMessage", ChatMessageSchema)
