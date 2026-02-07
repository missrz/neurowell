const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const generateAssessmentJob = require("./jobs/generateAssessmentJob")
require("./cron"); // Start cron jobs

dotenv.config();

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const moodRoutes = require("./routes/moodRoutes");
const journalRoutes = require("./routes/journalRoutes");
const analytics = require("./routes/analytics");
const usersRoutes = require('./routes/users');
const tipsRoutes = require('./routes/tips');
const resourcesRoutes = require('./routes/resources');
const assesmentRoutes = require('./routes/assesments');

const app = express();

// ========================
// Middleware
// ========================
app.use(cors());
app.use(express.json());

// ========================
// Environment Variables
// ========================
const PORT = process.env.PORT || 4000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/neurowell";
const AI_SERVER_URL = process.env.AI_SERVER_URL || "http://localhost:4001";

// ========================
// MongoDB Connection
// ========================
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ========================
// Routes
// ========================
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/analytics", analytics);
app.use("/api/users", usersRoutes);
app.use("/api/tips", tipsRoutes);
app.use("/api/resources", resourcesRoutes);
app.use('/api/assesments', assesmentRoutes);

// AI detection route
app.post("/api/detect", async (req, res, next) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  try {
    const axios = require("axios");
    const response = await axios.post(`${AI_SERVER_URL}/predict`, { text });
    res.json(response.data);
  } catch (error) {
    next(error); // Pass to error handler
  }
});

// ========================
// 404 Route
// ========================
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// ========================
// Global Error Handler
// ========================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

if (process.env.RUN_CRON_NOW === "true") {
  console.log("⚡ Manually triggering assessment job")
  generateAssessmentJob()
};

// ========================
// Start Server
// ========================
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
