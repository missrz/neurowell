// jobs/generateAssessmentJob.js
const axios = require("axios")
const Assesment = require("../models/Assesment")
const Question = require("../models/Question")

async function generateAssessmentJob() {
  try {
    console.log("🕐 Running daily assessment job...")

    // Check if an assessment already exists for today (server local date)
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    const existing = await Assesment.findOne({ createdAt: { $gte: startOfToday, $lt: startOfTomorrow } });
    if (existing) {
      console.log(`ℹ️ Assessment for today already exists (${existing._id}), skipping creation.`);
      return existing;
    }

    const { generateAssessment } = require('../services/aiService');
    const data = await generateAssessment(null, 5);

    // 1️⃣ Create Assesment
    // Validate response shape
    if (!data || !data.assessment || !Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error('AI returned invalid assessment payload');
    }

    const assesment = await Assesment.create({
      title: data.assessment.title,
      aiResponse: data.raw || data
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
