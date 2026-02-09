const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., "article", "video", "app"
  title: { type: String, required: true },
  description: { type: String, required: false },
  url: { type: String, required: true },
  language: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model("Resource", ResourceSchema);
