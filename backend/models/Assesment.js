const mongoose = require("mongoose");

const AssesmentSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., journal title or mood description
}, { timestamps: true });
 
module.exports = mongoose.model("Assesment", AssesmentSchema);
