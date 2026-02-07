const mongoose = require("mongoose");

const AssesmentSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., journal title or mood description
  aiResponse: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });
 
module.exports = mongoose.model("Assesment", AssesmentSchema);
