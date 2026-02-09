const express = require("express");
const router = express.Router();
const ValuableHistory = require("../models/valueableHistory");
const auth = require("../middleware/authMiddleware");

const ALLOWED_FIELDS = ["type", "name", "score"];


// POST /api/valueable_history
router.post("/", auth, async (req, res) => {
  try {
    const data = {};

    for (const field of ALLOWED_FIELDS) {
      if (field in req.body) {
        data[field] = req.body[field];
      }
    }

    if (!data.type || !data.name) {
      return res.status(400).json({ message: "type and name are required" });
    }

    data.userId = req.user.id; // IMPORTANT

    const history = await ValuableHistory.create(data);
    res.status(201).json(history);
  } catch (err) {
    console.error("Create valuable history error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/valueable_history
router.get("/", auth, async (req, res) => {
  try {
    const history = await ValuableHistory.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    console.error("Get valuable history error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/valueble_history/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const history = await ValuableHistory.findById(req.params.id);

    if (!history) {
      return res.status(404).json({ message: "Not found" });
    }

    if (
      history.userId.toString() !== req.user.id &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(history);
  } catch (err) {
    console.error("Get single history error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/valueble_history/:id
router.put("/:id", auth, async (req, res) => {
  try {
    const history = await ValuableHistory.findById(req.params.id);

    if (!history) {
      return res.status(404).json({ message: "Not found" });
    }

    if (
      history.userId.toString() !== req.user.id &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    for (const field of ALLOWED_FIELDS) {
      if (field in req.body) {
        history[field] = req.body[field];
      }
    }

    await history.save();
    res.json(history);
  } catch (err) {
    console.error("Update valuable history error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/valueble_history/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const history = await ValuableHistory.findById(req.params.id);

    if (!history) {
      return res.status(404).json({ message: "Not found" });
    }

    if (
      history.userId.toString() !== req.user.id &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await history.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete valuable history error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
