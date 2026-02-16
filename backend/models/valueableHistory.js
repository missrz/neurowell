const mongoose = require("mongoose");

const ValuableHistorySchema = new mongoose.Schema({
  type: { type: String, required: true }, // "games" or "assesment"
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true }, // e.g., games title or mood description
  score: { type: Number, required: false }, // Optional AI-generated score
  entity_id: { type: String, required: false }, // ID of the related entity (e.g., assessment entry ID)
}, { timestamps: true });
 
module.exports = mongoose.model("ValuableHistory", ValuableHistorySchema);
  