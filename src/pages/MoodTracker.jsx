import React, { useState } from "react";
import "../styles/MoodTracker.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function MoodTracker() {
  const finalMoods = [
    { emoji: "😊", mood: "Happy", color: "#1DB954" },
    { emoji: "😔", mood: "Sad", color: "#1976D2" },
    { emoji: "😡", mood: "Angry", color: "#D32F2F" },
    { emoji: "😱", mood: "Fear", color: "#0288D1" },
    { emoji: "🤢", mood: "Disgust", color: "#388E3C" },
    { emoji: "😐", mood: "Neutral", color: "#455A64" },
  ];

  const [selectedMoods, setSelectedMoods] = useState([]);
  const [rightPanelMoods, setRightPanelMoods] = useState([]);
  const [history, setHistory] = useState([]);

  const toggleMood = (mood, panel = "left") => {
    if (panel === "left") {
      setSelectedMoods((prev) =>
        prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
      );
    } else {
      setRightPanelMoods((prev) =>
        prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
      );
    }
  };

  const addToHistory = (panel = "left") => {
    const moodsToAdd = panel === "left" ? selectedMoods : rightPanelMoods;
    if (moodsToAdd.length === 0) return;

    const newEntry = {
      id: Date.now(),
      moods: [...moodsToAdd],
      timestamp: new Date(),
    };

    setHistory([newEntry, ...history]);
    if (panel === "left") setSelectedMoods([]);
    else setRightPanelMoods([]);
  };

  const deleteHistory = (id) => {
    setHistory(history.filter((h) => h.id !== id));
  };

  const moodCounts = finalMoods.map(
    (m) =>
      history.reduce(
        (acc, h) => acc + h.moods.filter((hm) => hm === m.mood).length,
        0
      )
  );

  const total = moodCounts.reduce((a, b) => a + b, 0);

  const neonBlueShades = ["#00BFFF", "#1E90FF", "#3399FF", "#3399CC", "#3366CC", "#003366"];

  const pieData = {
    labels: finalMoods.map((m) => m.mood),
    datasets: [
      {
        label: "Mood History",
        data: moodCounts,
        backgroundColor: neonBlueShades.slice(0, finalMoods.length),
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
        formatter: (value) => (total ? `${Math.round((value / total) * 100)}%` : ""),
        font: { weight: "bold", size: 14 },
      },
    },
  };

  return (
    <div className="tracker-container">
      {/* Left Panel: Mood History */}
      <div className="history-section">
        <h2>Mood History</h2>
        <ul>
          {history.map((entry) => (
            <li key={entry.id}>
              <div className="moods-row">
                {entry.moods.slice(0, 2).map((mood) => {
                  const color = finalMoods.find((f) => f.mood === mood)?.color || "#fff";
                  const emoji = finalMoods.find((f) => f.mood === mood)?.emoji;
                  return (
                    <div key={mood} className="mood-item" style={{ borderColor: color }}>
                      <span className="mood-emoji">{emoji}</span>
                      <span className="mood-name">{mood}</span>
                    </div>
                  );
                })}
              </div>
              <div className="timestamp">{entry.timestamp.toLocaleString()}</div>
              <button className="delete-btn" onClick={() => deleteHistory(entry.id)}>
                🗑️
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Center Pie Chart */}
      <div className="pie-container">
        <div className="pie-chart">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>

      {/* Right Panel: Emoji Selection */}
      <div className="history-section right-panel">
        <h2>Select Mood</h2>
        <div className="mood-grid">
          {finalMoods.map((m) => (
            <button
              key={m.mood}
              className={`mood-btn ${rightPanelMoods.includes(m.mood) ? "selected" : ""}`}
              style={{ "--neon-color": m.color }}
              onClick={() => toggleMood(m.mood, "right")}
            >
              {m.emoji} {m.mood}
            </button>
          ))}
        </div>
        <div className="add-btn-container">
          <button className="add-btn" onClick={() => addToHistory("right")}>
            Add to History
          </button>
        </div>
      </div>
    </div>
  );
}
