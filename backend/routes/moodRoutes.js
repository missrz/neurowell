const express = require("express");
const router = express.Router();
const Mood = require("../models/Mood"); // Adjust path if needed
const auth = require("../middleware/authMiddleware");

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
    const moods = await Mood.find().sort({ timestamp: -1 });
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
    const moods = await Mood.find({ userId }).sort({ timestamp: -1 });
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
      console.log("Background job started for:", req.user.id)

      console.log("Background job finished for:", req.user.id)
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
