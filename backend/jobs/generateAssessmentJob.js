// jobs/generateAssessmentJob.js
const axios = require("axios")
const Assesment = require("../models/Assesment")
const Question = require("../models/Question")

async function generateAssessmentJob() {
  try {
    console.log("🕐 Running daily assessment job...")

    const { generateAssessment } = require('../services/aiService');
    const data = await generateAssessment(null, 5);

    // 1️⃣ Create Assesment
    const assesment = await Assesment.create({
      title: data.assessment.title,
      aiResponse: data.raw
    })

    // 2️⃣ Create Questions
    const questions = data.questions.map(q => ({
      title: q.title,
      options: q.options,
      correctAnswer: q.correctAnswer,
      assesmentId: assesment._id
    }))

    await Question.insertMany(questions)

    console.log(
      `✅ Assessment created (${assesment._id}) with ${questions.length} questions`
    )
  } catch (error) {
    console.error("❌ Daily assessment job failed:", error.message)
  }
}

module.exports = generateAssessmentJob
