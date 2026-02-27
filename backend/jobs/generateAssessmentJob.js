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
    let existing = await Assesment.findOne({ createdAt: { $gte: startOfToday, $lt: startOfTomorrow } });
    if (existing) {
      console.log(`ℹ️ Assessment for today already exists (${existing._id}), skipping creation.`);
      return existing;
    }

    const { generateAssessment } = require('../services/aiService');
    let data = null;
    try {
      data = await generateAssessment(null, 5);
    } catch (e) {
      console.warn('generateAssessmentJob: AI generation failed:', e && e.message ? e.message : e);
    }

    // If AI returned an invalid payload, create a safe fallback assessment + question
    if (!data || !data.assessment || !Array.isArray(data.questions) || data.questions.length === 0) {
      console.warn('generateAssessmentJob: AI returned invalid payload — creating fallback assessment');
      try {
        const fallback = await Assesment.create({
          title: 'Daily assessment (fallback)',
          aiResponse: data || { error: 'AI generation failed or returned invalid payload' }
        });

        const fallbackQuestion = {
          title: 'How are you feeling today?',
          options: ['Great', 'Okay', 'Not great', 'Prefer not to say'],
          correctAnswer: 'Okay',
          assesmentId: fallback._id
        };

        await Question.create(fallbackQuestion);
        console.log(`✅ Fallback assessment created (${fallback._id})`);
        return fallback;
      } catch (e2) {
        console.error('generateAssessmentJob: failed to create fallback assessment:', e2 && e2.message ? e2.message : e2);
        throw e2;
      }
    }

    // 1️⃣ Create Assesment
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
