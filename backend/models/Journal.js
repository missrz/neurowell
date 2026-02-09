const mongoose = require("mongoose");

const JournalSchema = new mongoose.Schema({
  text: {type: String, required: true},
  title: {type: String, required: true},
  userId: { type: mongoose.Schema.Types.ObjectId,  // Optional: link to a user
  ref: "User",
  required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  pinned: { type: Boolean, required: false },
  aiResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  score: {
    type: Number,             // Optional: AI-generated mood score (e.g., 0-100)
    default: null,
    required: false
  },
}, { timestamps: true });

module.exports = mongoose.model("Journal", JournalSchema);
