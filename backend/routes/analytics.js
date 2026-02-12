const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")

const Mood = require("../models/Mood")
const Journal = require("../models/Journal")
const ValuableHistory = require("../models/valueableHistory")
const auth = require("../middleware/authMiddleware");

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

// GET /api/analytics?type=mood|journal|valuable&period=day|week|month|year
router.get("/", async (req, res) => {
  try {
    const { type, period } = req.query

    if (!type || !period) {
      return res.status(400).json({
        error: "type and period are required"
      })
    }

    const modelMap = {
      mood: Mood,
      journal: Journal,
      valuable: ValuableHistory
    }

    const Model = modelMap[type]

    if (!Model) {
      return res.status(400).json({ error: "Invalid type" })
    }

    const groupFormat = getGroupFormat(period)

    const data = await Model.aggregate([
      {
        $group: {
          _id: groupFormat,
          totalScore: { $sum: "$score" },
          averageScore: { $avg: "$score" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ])

    res.json({
      type,
      period,
      data
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

function getGroupFormat(period) {
  switch (period) {
    case "day":
      return {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" }
      }

    case "week":
      return {
        year: { $year: "$createdAt" },
        week: { $week: "$createdAt" }
      }

    case "month":
      return {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      }

    case "year":
      return {
        year: { $year: "$createdAt" }
      }

    default:
      throw new Error("Invalid period")
  }
}

module.exports = router
