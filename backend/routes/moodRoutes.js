const express = require("express");
const router = express.Router();
const Mood = require("../models/Mood"); // Adjust path if needed
const auth = require("../middleware/authMiddleware");
const { scoreText } = require('../services/aiService');
const Tip = require('../models/Tip');
const { formatDateTime } = require('../utils/formatDate');

// ============================
// Create a new mood
// POST /api/moods
// ============================
router.post("/", auth, async (req, res) => {
  try {
    const { moods, description, score } = req.body;

    if (!moods || moods.length === 0) {
      return res.status(400).json({ message: "Moods array is required." });
    }

    const newMood = new Mood({
      moods,
      description,
      score,
      userId: req.user.id // 🔥 from token
    });

    const savedMood = await newMood.save();
    setImmediate(() => {
      (async () => {
        console.log("Background job started for:", req.user.id);
        try {
          const text = (moods && moods.length ? moods.join(', ') : '') + (description ? '\n' + description : '');
          const aiResp = await scoreText(text);
          const score = aiResp && aiResp.score != null ? aiResp.score : null;
          const aiData = aiResp.raw || aiResp;
          await Mood.findByIdAndUpdate(savedMood._id, { $set: { score, aiResponse: aiData } });

          // create a Tip with advice from AI
          try {
            let advice = '';
            if (aiData) {
              if (typeof aiData === 'object') {
                advice = aiData.advice || aiData.message || aiData.text || '';
              } else if (typeof aiData === 'string') {
                advice = aiData;
              }
            }
            const title = `my mood tracking advice for ${moods.join(', ')} on ${formatDateTime(savedMood.createdAt)}`;
            const tip = new Tip({ userId: req.user.id, title, description: advice || '', entity_id: savedMood._id.toString(), entityType: 'mood' });
            await tip.save();
          } catch (e) {
            console.error('Failed to create Tip for mood', savedMood._id, e && e.message ? e.message : e);
          }

          console.log("Background job finished for:", req.user.id, "score:", score);
        } catch (err) {
          console.error('Background AI scoring error for user', req.user.id, err && err.message ? err.message : err);
        }
      })();
    });
    res.status(201).json(savedMood);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ============================
// Get all moods
// GET /api/moods
// ============================
router.get("/", auth, async (req, res) => {
  try {
    // Admin-only: only users with isAdmin flag may list all moods
    if (!req.user || !req.user.isAdmin) {
      console.warn('Unauthorized attempt to list all moods by user', req.user && req.user.id);
      return res.status(403).json({ message: 'Forbidden: admin only' });
    }
    const moods = await Mood.find().sort({ createdAt: -1 });
    res.status(200).json(moods);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ============================
// Get moods by userId
// GET /api/moods/user/:userId
// ============================
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const moods = await Mood.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(moods);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ============================
// Update a mood by ID
// PUT /api/moods/:id
// ============================
router.put("/:id", auth, async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);

    if (!mood) {
      return res.status(404).json({ message: "Mood not found" });
    }

    if (mood.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    mood.moods = req.body.moods;
    mood.description = req.body.description;
    await mood.save();

    setImmediate(() => {
      (async () => {
        console.log("Background job started for:", req.user.id);
        try {
          const text = (mood.moods && mood.moods.length ? mood.moods.join(', ') : '') + (mood.description ? '\n' + mood.description : '');
          const aiResp = await scoreText(text);
          const score = aiResp && aiResp.score != null ? aiResp.score : null;
          const aiData = aiResp.raw || aiResp;
          await Mood.findByIdAndUpdate(mood._id, { $set: { score, aiResponse: aiData } });

          // create a Tip with advice from AI
          try {
            let advice = '';
            if (aiData) {
              if (typeof aiData === 'object') {
                advice = aiData.advice || aiData.message || aiData.text || '';
              } else if (typeof aiData === 'string') {
                advice = aiData;
              }
            }
            const title = `my mood tracking advice for ${(mood.moods || []).join(', ')} on ${formatDateTime(mood.createdAt)}`;
            const tip = new Tip({ userId: req.user.id, title, description: advice || '', entity_id: mood._id.toString(), entityType: 'mood' });
            await tip.save();
          } catch (e) {
            console.error('Failed to create Tip for mood', mood._id, e && e.message ? e.message : e);
          }

          console.log("Background job finished for:", req.user.id, "score:", score);
        } catch (err) {
          console.error('Background AI scoring error for user', req.user.id, err && err.message ? err.message : err);
        }
      })();
    });

    res.status(200).json(mood);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ============================
// Show a mood by ID
// GET /api/moods/:id
// ============================
router.get("/:id", auth, async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);

    if (!mood) {
      return res.status(404).json({ message: "Mood not found" });
    }

    if (mood.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(mood);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ============================
// Delete a mood by ID
// DELETE /api/moods/:id
// ============================
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMood = await Mood.findByIdAndDelete(id);

    if (!deletedMood) {
      return res.status(404).json({ message: "Mood not found" });
    }

    res.status(200).json({ message: "Mood deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


module.exports = router;
