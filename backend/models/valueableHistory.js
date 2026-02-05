const mongoose = require("mongoose");

const ValuableHistorySchema = new mongoose.Schema({
  type: { type: String, required: true }, // "journal" or "mood"
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true }, // e.g., journal title or mood description
  score: { type: Number, required: false }, // Optional AI-generated score
}, { timestamps: true });
 
module.exports = mongoose.model("ValuableHistory", ValuableHistorySchema);
  