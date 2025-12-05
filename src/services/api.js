import axios from "axios";

// POST text to Python backend and get prediction
export const detectMood = async (text) => {
  try {
    const res = await axios.post("/api/detect", { text });
    return res.data; // { mood, confidence, advice }
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
};
