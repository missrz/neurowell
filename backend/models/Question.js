const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  options: { type: [String], required: true }, // Array of options for the question
  correctAnswer: { type: String, required: true }, // The correct answer for the question
}, { timestamps: true });

module.exports = mongoose.model("Question", QuestionSchema);
