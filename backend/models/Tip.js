const mongoose = require("mongoose");

const TipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  isReaded: { type: Boolean, default: false },
  entity_id: { type: String, required: true }, // ID of the related journal or mood
  entityType: { type: String, required: true }, // "journal" or "mood"
}, { timestamps: true });

module.exports = mongoose.model("Tip", TipSchema);
