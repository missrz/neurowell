const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const generateAssessmentJob = require("./jobs/generateAssessmentJob")
require("./cron"); // Start cron jobs

dotenv.config();

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const chatsRoutes = require("./routes/chats");
const moodRoutes = require("./routes/moodRoutes");
const journalRoutes = require("./routes/journalRoutes");
const analytics = require("./routes/analytics");
const usersRoutes = require('./routes/users');
const tipsRoutes = require('./routes/tips');
const resourcesRoutes = require('./routes/resources');
const assesmentRoutes = require('./routes/assesments');
const valuebleHistoryRoutes = require('./routes/valueable_history');
const apiKeysRoutes = require('./routes/apiKeys');

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
const apiKeyService = require('./services/apiKeyService');
const chatWithGemini = require('./services/geminiChat');

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
app.use('/api/chats', chatsRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/analytics", analytics);
app.use("/api/users", usersRoutes);
app.use("/api/tips", tipsRoutes);
app.use("/api/resources", resourcesRoutes);
app.use('/api/assesments', assesmentRoutes);
app.use('/api/valueble_history', valuebleHistoryRoutes);
app.use('/api/api-keys', apiKeysRoutes);


// AI detection route
app.post("/api/detect", async (req, res, next) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  try {
    // Try to use a stored Gemini key (managed in DB) first. If no key or call fails, fall back to Python AI proxy.
    try {
      const active = await apiKeyService.getActiveKey('gemini');
      if (active && active.key) {
        const reply = await chatWithGemini({ message: text, apiKey: active.key });
        return res.json({ answer: reply });
      }
    } catch (innerErr) {
      console.error('Node Gemini attempt failed, falling back to Python AI:', innerErr.message || innerErr);
    }

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
