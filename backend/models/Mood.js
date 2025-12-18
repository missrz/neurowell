const mongoose = require("mongoose");

// Define schema for moods
const MoodSchema = new mongoose.Schema({
  moods: {
    type: [String],           // Array of moods (e.g., ["happy", "relaxed"])
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,  // Optional: link to a user
    ref: "User",
    required: true
  },
  description: {
    type: String,             // Optional: user description of mood
    default: "",
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Export the Mongoose model
module.exports = mongoose.model("Mood", MoodSchema);
