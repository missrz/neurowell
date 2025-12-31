const express = require("express");
const router = express.Router();
const Mood = require("../models/Mood");
const auth = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

/**
 * GET /api/analytics/mood-usage?range=daily|weekly|monthly|yearly
 */
router.get("/mood-usage", auth, async (req, res) => {
  try {
    const { range } = req.query;
    const userId = req.user.id;

    let startDate = new Date();
    let groupFormat = "%Y-%m-%d";

    if (range === "daily") {
      startDate.setHours(0, 0, 0, 0);
      groupFormat = "%Y-%m-%d";
    } 
    else if (range === "weekly") {
      startDate.setDate(startDate.getDate() - 7);
      groupFormat = "%Y-%m-%d";
    } 
    else if (range === "monthly") {
      startDate.setMonth(startDate.getMonth() - 1);
      groupFormat = "%Y-%m";
    } 
    else if (range === "yearly") {
      startDate.setFullYear(startDate.getFullYear() - 1);
      groupFormat = "%Y";
    }

    const analytics = await Mood.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          timestamp: { $gte: startDate }, // 🔥 timestamp use
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: "$timestamp",
            },
          },
          usageCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
