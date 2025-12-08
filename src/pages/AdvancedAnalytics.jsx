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

export default function AdvancedAnalytics() {
  const exportRef = useRef(null);
  const [range, setRange] = useState("week");
  const [chartData, setChartData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [heatmapItems, setHeatmapItems] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  const fetchMoodData = async (range) => {
    try {
      const res = await fetch(`/api/moods?range=${range}`);
      return await res.json();
    } catch {
      return generateMock(range);
    }
  };

  const fetchActivityData = async (range) => {
    try {
      const res = await fetch(`/api/activity?range=${range}`);
      return await res.json();
    } catch {
      return generateMock(range).map((d) => ({
        ...d,
        journaling: Math.round(Math.random() * 3),
      }));
    }
  };

  const fetchPrediction = async () => {
    setLoadingPrediction(true);
    try {
      const res = await fetch("/api/predict-mood", { method: "POST" });
      const data = await res.json();
      setPrediction({ server: data });
    } catch {
      setPrediction({ server: null });
    } finally {
      setLoadingPrediction(false);
    }
  };

  const handleRangeChange = async (r) => {
    setRange(r);
    const mood = await fetchMoodData(r);
    const act = await fetchActivityData(r);

    setChartData(mood);
    setActivityData(act);
    setHeatmapItems(
      mood.map((d) => ({ id: d.label, value: Math.round(d.mood) }))
    );
  };

  useEffect(() => {
    handleRangeChange(range);
    fetchPrediction();
  }, []);

  const generateMock = (r) => {
    if (r === "day") {
      return Array.from({ length: 24 }, (_, h) => ({
        label: `${h}:00`,
        mood: +(3 + Math.random() * 2).toFixed(2),
      }));
    } else if (r === "week") {
      return Array.from({ length: 7 }, (_, i) => ({
        label: `Day-${i + 1}`,
        mood: +(3 + Math.random() * 2).toFixed(2),
      }));
    } else if (r === "month") {
      return Array.from({ length: 30 }, (_, i) => ({
        label: `D${i + 1}`,
        mood: +(3 + Math.random() * 2).toFixed(2),
      }));
    } else if (r === "year") {
      return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => ({
        label: m,
        mood: +(3 + Math.random() * 2).toFixed(2),
        journaling: Math.round(Math.random() * 5),
      }));
    }
    return [];
  };

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

  const downloadCSV = () => {
    const rows = [["Label", "Mood", "Journaling"]];
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

      {/* Top buttons */}
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

      {/* Whole analytics export section */}
      <div ref={exportRef} className="analytics-box">

        {/* Charts */}
        <div className="grid-two">
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
          {prediction?.server ? (
            <p className="prediction-value">{prediction.server.predicted}/5</p>
          ) : (
            <p className="muted">No server prediction</p>
          )}
        </div>

      </div>
    </div>
  );
}
