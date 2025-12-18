// src/pages/AdvancedAnalytics.jsx

import React, { useRef, useState, useEffect } from "react";
import "../styles/AdvancedAnalytics.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* ================= MOOD → SCORE MAP ================= */
const moodScoreMap = {
  Happy: 5,
  Excited: 5,
  Enjoying: 4,
  Calm: 4,
  Reflective: 3,
  Neutral: 3,
  Confused: 2,
  Sad: 2,
  Lonely: 2,
  Anxiety: 2,
  Stressed: 1,
  Angry: 1,
  Depressed: 1,
  Demotivated: 1,
  Fear: 1,
  Disgust: 1,
};

export default function AdvancedAnalytics() {
  const exportRef = useRef(null);

  const [range, setRange] = useState("week");
  const [chartData, setChartData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [heatmapItems, setHeatmapItems] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  /* ================= READ MOOD HISTORY ================= */
  const getMoodHistory = () =>
    JSON.parse(localStorage.getItem("moodHistory") || "[]");

  /* ================= CALCULATE AVERAGE MOOD ================= */
  const avgMood = (moods) => {
    if (!moods.length) return 0;
    const total = moods.reduce(
      (sum, m) => sum + (moodScoreMap[m] || 3),
      0
    );
    return +(total / moods.length).toFixed(2);
  };

  /* ================= GENERATE DATA BY RANGE ================= */
  const generateFromHistory = (range) => {
    const history = getMoodHistory();
    if (!history.length) return [];

    const buckets = {};

    history.forEach((entry) => {
      const date = new Date(entry.timestamp);
      let key = "";

      if (range === "day") {
        key = `${date.getHours()}:00`;
      } else if (range === "week") {
        key = date.toLocaleDateString("en-US", { weekday: "short" });
      } else if (range === "month") {
        key = `D${date.getDate()}`;
      } else if (range === "year") {
        key = date.toLocaleDateString("en-US", { month: "short" });
      }

      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(avgMood(entry.moods));
    });

    return Object.keys(buckets).map((label) => ({
      label,
      mood: +(
        buckets[label].reduce((a, b) => a + b, 0) / buckets[label].length
      ).toFixed(2),
    }));
  };

  /* ================= ACTIVITY DATA ================= */
  const generateActivityData = (base) =>
    base.map((d) => ({
      ...d,
      journaling: Math.floor(Math.random() * 4), // optional placeholder
    }));

  /* ================= PREDICTION ================= */
  const fetchPrediction = async () => {
    setLoadingPrediction(true);
    try {
      const history = getMoodHistory();
      if (!history.length) {
        setPrediction(null);
        return;
      }

      const recent = history.slice(0, 5);
      const score =
        recent.reduce((s, e) => s + avgMood(e.moods), 0) / recent.length;

      setPrediction({ predicted: score.toFixed(1) });
    } finally {
      setLoadingPrediction(false);
    }
  };

  /* ================= RANGE CHANGE ================= */
  const handleRangeChange = (r) => {
    setRange(r);

    const moodData = generateFromHistory(r);
    setChartData(moodData);
    setActivityData(generateActivityData(moodData));

    setHeatmapItems(
      moodData.map((d) => ({
        id: d.label,
        value: Math.round(d.mood),
      }))
    );
  };

  /* ================= INIT ================= */
  useEffect(() => {
    handleRangeChange(range);
    fetchPrediction();
  }, []);

  /* ================= EXPORT PDF ================= */
  const exportToPDF = async () => {
    const canvas = await html2canvas(exportRef.current, { scale: 2 });
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0);
    pdf.save("NeuroWell_Analytics.pdf");
  };

  /* ================= EXPORT CSV ================= */
  const downloadCSV = () => {
    const rows = [["Label", "Average Mood", "Journaling"]];
    chartData.forEach((d, i) =>
      rows.push([d.label, d.mood, activityData[i]?.journaling ?? 0])
    );

    const csv =
      "data:text/csv;charset=utf-8," +
      rows.map((r) => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `Analytics_${range}.csv`;
    link.click();
  };

  /* ================= JSX ================= */
  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="header-row">
        <h1 className="page-title">Advanced Analytics — NeuroWellInsight</h1>
        <div className="range-selector">
          {["day", "week", "month", "year"].map((r) => (
            <button
              key={r}
              onClick={() => handleRangeChange(r)}
              className={`range-btn ${range === r ? "active" : ""}`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="actions-row">
        <button className="analytics-btn" onClick={fetchPrediction}>
          {loadingPrediction ? "Predicting..." : "Run Prediction"}
        </button>

        <button className="analytics-btn" onClick={exportToPDF}>
          Export PDF
        </button>

        <button className="analytics-btn" onClick={downloadCSV}>
          Download CSV
        </button>
      </div>

      {/* Export Section */}
      <div ref={exportRef} className="analytics-box">
        <div className="grid-two">
          {/* Line Chart */}
          <div className="card">
            <h3 className="card-title">Mood Trend ({range})</h3>
            <div className="chart-container">
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2b3544" />
                  <XAxis dataKey="label" stroke="#9ca3af" />
                  <YAxis domain={[1, 5]} stroke="#9ca3af" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#4b9fff"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="card">
            <h3 className="card-title">Activity (Journaling)</h3>
            <div className="chart-container">
              <ResponsiveContainer>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2b3544" />
                  <XAxis dataKey="label" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="journaling"
                    radius={[6, 6, 0, 0]}
                    fill="#0ea5a4"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="card">
          <h3 className="card-title">Heatmap ({range})</h3>
          <div
            className={`heatmap-grid ${
              range === "day"
                ? "cols-24"
                : range === "year"
                ? "cols-12"
                : "cols-10"
            }`}
          >
            {heatmapItems.map((c) => (
              <div
                key={c.id}
                className={`heatmap-cell mood-${c.value}`}
                title={`${c.id}: mood ${c.value}`}
              ></div>
            ))}
          </div>
        </div>

        {/* Prediction */}
        <div className="prediction-card">
          <h3 className="card-title">Prediction</h3>
          {prediction ? (
            <p className="prediction-value">{prediction.predicted}/5</p>
          ) : (
            <p className="muted">Not enough data</p>
          )}
        </div>
      </div>
    </div>
  );
}
