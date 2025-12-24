const mongoose = require("mongoose");

const JournalSchema = new mongoose.Schema({
  text: {type: String, required: true},
  title: {type: String, required: true},
  userId: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  pinned: { type: Boolean, required: false },
  suggestion: String,
}, { timestamps: true });

module.exports = mongoose.model("Journal", JournalSchema);
