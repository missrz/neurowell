import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/MoodTracker.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const moods = [
  { name: "Happy", emoji: "😊", color: "#FFD700" },
  { name: "Sad", emoji: "😢", color: "#1E90FF" },
  { name: "Angry", emoji: "😡", color: "#FF4500" },
  { name: "Neutral", emoji: "😐", color: "#808080" },
  { name: "Excited", emoji: "🤩", color: "#FF69B4" },
];

export default function MoodTracker() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("moodHistory");
    if (stored) setMoodHistory(JSON.parse(stored));
  }, []);

  const saveMood = () => {
    if (!selectedMood) return alert("Select a mood first!");
    const today = new Date().toISOString().split("T")[0];
    const updatedHistory = { ...moodHistory, [today]: selectedMood };
    setMoodHistory(updatedHistory);
    localStorage.setItem("moodHistory", JSON.stringify(updatedHistory));
    setSelectedMood(null);
  };

  const deleteMood = (date) => {
    if (!window.confirm("Delete this mood?")) return;
    const updated = { ...moodHistory };
    delete updated[date];
    setMoodHistory(updated);
    localStorage.setItem("moodHistory", JSON.stringify(updated));
  };

  const chartData = {
    labels: Object.keys(moodHistory).sort(),
    datasets: [
      {
        label: "Mood",
        data: Object.values(moodHistory).map((m) => {
          switch (m) {
            case "Happy": return 5;
            case "Excited": return 4;
            case "Neutral": return 3;
            case "Sad": return 2;
            case "Angry": return 1;
            default: return 0;
          }
        }),
        backgroundColor: Object.values(moodHistory).map((m) => {
          const mood = moods.find((x) => x.name === m);
          return mood ? mood.color : "#fff";
        }),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    animation: { duration: 1000, easing: "easeInOutQuart" },
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 5, ticks: { stepSize: 1 } },
    },
  };

  return (
    <div className="mood-container d-flex flex-column align-items-center">
      <button className="mood-close-btn btn btn-danger" onClick={() => navigate("/dashboard")}>
        ✕
      </button>

      <h1 className="mt-4 mb-3 text-light">Mood Tracker</h1>

      <div className="d-flex flex-wrap justify-content-center mb-3">
        {moods.map((m) => (
          <button
            key={m.name}
            className={`btn mood-btn m-2 ${selectedMood === m.name ? "selected" : ""}`}
            style={{ backgroundColor: m.color }}
            onClick={() => setSelectedMood(m.name)}
          >
            <span className="emoji">{m.emoji}</span> {m.name}
          </button>
        ))}
      </div>

      <button className="btn btn-info mb-4" onClick={saveMood}>
        Save / Update Mood
      </button>

      <h2 className="text-light">Past Moods</h2>
      <div className="d-flex flex-wrap justify-content-center mb-4">
        {Object.keys(moodHistory)
          .sort((a, b) => b.localeCompare(a))
          .map((date) => (
            <div key={date} className="card mood-card m-2 p-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{date}</strong>: {moodHistory[date]}
                </div>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteMood(date)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      <div className="chart-container w-75">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
