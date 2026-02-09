// cron.js
const cron = require("node-cron")
const generateAssessmentJob = require("./jobs/generateAssessmentJob")

console.log("🕒 Cron scheduler initialized")

cron.schedule("0 1 * * *", async () => {
  console.log("⏰ Cron triggered: generateAssessmentJob")
  await generateAssessmentJob()
})
