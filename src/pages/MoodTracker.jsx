import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../styles/MoodTracker.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

import {
  saveMood,
  fetchMoodHistory,
  deleteMood,
} from "../services/api";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function MoodTracker() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.user);
  const userId = currentUser?._id || currentUser?.id;
  
  /* ================= FINAL MOODS ================= */
  const finalMoods = [
    { emoji: "😊", mood: "Happy", color: "#EECEDA" },
    { emoji: "😔", mood: "Sad", color: "#704F52" },
    { emoji: "😌", mood: "Calm", color: "#F09F9C" },
    { emoji: "🤔", mood: "Reflective", color: "#b7c4bb" },
    { emoji: "😰", mood: "Stressed", color: "#F67280" },
    { emoji: "😡", mood: "Angry", color: "#EBB195" },
    { emoji: "😱", mood: "Fear", color: "#CD6C84" },
    { emoji: "🤢", mood: "Disgust", color: "#605878" },
    { emoji: "😐", mood: "Neutral", color: "#355C70" },
    { emoji: "😟", mood: "Anxiety", color: "#F67280" },
    { emoji: "😞", mood: "Depressed", color: "#EBB195" },
    { emoji: "🥺", mood: "Lonely", color: "#CD6C84" },
    { emoji: "🤩", mood: "Excited", color: "#605878" },
    { emoji: "😄", mood: "Enjoying", color: "#355C70" },
    { emoji: "😕", mood: "Confused", color: "#F67280" },
    { emoji: "😣", mood: "Demotivated", color: "#EBB195" },
  ];
  
  /* ================= STATES ================= */
  const [rightPanelMoods, setRightPanelMoods] = useState([]);
  const [history, setHistory] = useState([]);
  const [description, setDescription] = useState("");
  
  /* ================= LOAD FROM BACKEND ================= */
  useEffect(() => {
    if (!userId) return;
    
    
    const loadMoods = async () => {
      try {
        const data = await fetchMoodHistory(userId);
        setHistory(
          data.map((d) => ({
            id: d._id,
            moods: d.moods.map(
              (m) => m.charAt(0).toUpperCase() + m.slice(1)
            ),
            description: d.description,
            timestamp: d.createdAt || d.timestamp,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch mood history", err);
      }
    };
    
    loadMoods();
  }, [userId]);
  
  /* ================= TOGGLE MOOD ================= */
  const toggleMood = (mood) => {
    setRightPanelMoods((prev) =>
      prev.includes(mood)
    ? prev.filter((m) => m !== mood)
    : [...prev, mood]
  );
};

/* ================= ADD ================= */
const addToHistory = async () => {
  if (rightPanelMoods.length === 0) return;
  
  try {
    const payload = {
      moods: rightPanelMoods.map((m) => m.toLowerCase()),
      description,
      userId,
    };
    
    const saved = await saveMood(payload);
    
    // 👇 ADD ENTRY LOCALLY (no reload needed)
    const newEntry = {
      id: saved._id || Date.now(),
      moods: rightPanelMoods,
      description,
      timestamp: new Date().toISOString(),
    };
    
    setHistory((prev) => [newEntry, ...prev]);
    
    setRightPanelMoods([]);
    setDescription("");
  } catch (err) {
    console.error("Failed to save mood", err);
  }
};


/* ================= DELETE ================= */
const deleteHistory = async (id) => {
  try {
    await deleteMood(id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
  } catch (err) {
    console.error("Delete failed", err);
  }
};

/* ================= PIE DATA ================= */
const moodCounts = finalMoods.map((m) =>
  history.reduce(
  (acc, h) => acc + h.moods.filter((hm) => hm === m.mood).length,
  0
)
);

const total = moodCounts.reduce((a, b) => a + b, 0);

const pieData = {
  labels: finalMoods.map((m) => m.mood),
  datasets: [
    {
      data: moodCounts,
      backgroundColor: finalMoods.map((m) => m.color),
      borderColor: "#0a0a0a",
      borderWidth: 2,
    },
  ],
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom", labels: { color: "#fff" } },
    datalabels: {
      color: "#fff",
      formatter: (v) => {
        if (!v || !total) return null;
        return `${Math.round((v / total) * 100)}%`;
      },
      
    },
  },
};

/* ================= CLOSE ================= */
const handleClose = () => navigate("/dashboard");
if (!userId) {
  return <div className="loading">Loading mood tracker...</div>;
}

/* ================= JSX ================= */
return (
  <div className="tracker-container">
  <button className="close-btn" onClick={handleClose}>❌</button>
  
  {/* LEFT */}
  <div className="history-section">
  <h2>Mood History</h2>
  <ul>
  {history.map((entry) => (
    <li key={entry.id}>
    <div className="moods-row">
    {entry.moods.map((m) => (
      <div key={m} className="mood-item">
      <span className="mood-emoji">
      {finalMoods.find((f) => f.mood === m)?.emoji}
      </span>
      <span className="mood-name">{m}</span>
      </div>
    ))}
    </div>
    
    {entry.description && (
      <div className="description">{entry.description}</div>
    )}
    
    <div className="timestamp">
    {new Date(entry.timestamp).toLocaleString()}
    </div>
    
    <button
    className="delete-btn"
    onClick={() => deleteHistory(entry.id)}
    >
    🗑️
    </button>
    </li>
  ))}
  </ul>
  </div>
  
  {/* CENTER */}
  <div className="pie-container">
  <div className="pie-chart">
  {total > 0 ? (
    <Pie data={pieData} options={pieOptions} />
  ) : (
    <p className="no-data">No mood data yet</p>
  )}
  </div>
  </div>
  
  {/* RIGHT */}
  <div className="history-section right-panel">
  <h2>Select Mood</h2>
  
  <div className="mood-grid">
  {finalMoods.map((m) => (
    <button
    key={m.mood}
    className={`mood-btn ${
      rightPanelMoods.includes(m.mood) ? "selected" : ""
    }`}
    style={{ "--neon-color": m.color }}
    onClick={() => toggleMood(m.mood)}
    >
    {m.emoji} {m.mood}
    </button>
  ))}
  </div>
  
  <textarea
  className="mood-description"
  placeholder="Describe how you're feeling (optional)"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  />
  
  <button className="add-btn" onClick={addToHistory}>
  Add to History
  </button>
  </div>
  </div>
);
}
