// src/pages/AdvancedAnalytics.jsx

import React, { useRef, useState, useEffect, useMemo } from "react";

import "../styles/AdvancedAnalytics.css";
import { motion } from "framer-motion";
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

/* AdvancedAnalytics.jsx
- Option A: single chart switches data by range (Day / Week / Month / Year)
- Fetches real API endpoints (replace URLs with your backend)
- Includes CSV download
- Exports PDF
*/

export default function AdvancedAnalytics() {
  const exportRef = useRef(null);
  const [range, setRange] = useState("week");
  const [chartData, setChartData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [heatmapItems, setHeatmapItems] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  // ---------------------------
  // Real API Fetchers
  // ---------------------------
  const fetchMoodData = async (range) => {
    try {
      // Example: replace with your endpoint
      const res = await fetch(`/api/moods?range=${range}`);
      const data = await res.json(); // expected [{ label, mood }]
      return data;
    } catch (err) {
      console.warn("Mood fetch failed, using mock", err);
      return generateMock(range);
    }
  };

  const fetchActivityData = async (range) => {
    try {
      const res = await fetch(`/api/activity?range=${range}`);
      const data = await res.json(); // expected [{ label, journaling }]
      return data;
    } catch (err) {
      console.warn("Activity fetch failed, using mock", err);
      return generateMock(range).map((d) => ({ ...d, journaling: Math.round(Math.random() * 3) }));
    }
  };

  const fetchPrediction = async () => {
    setLoadingPrediction(true);
    try {
      const res = await fetch("/api/predict-mood", { method: "POST" });
      const data = await res.json();
      setPrediction({ server: data });
    } catch (err) {
      console.warn("AI prediction failed, using local heuristic", err);
      setPrediction({ server: null });
    } finally {
      setLoadingPrediction(false);
    }
  };

  // ---------------------------
  // Range change handler
  // ---------------------------
  const handleRangeChange = async (r) => {
    setRange(r);
    const mood = await fetchMoodData(r);
    const act = await fetchActivityData(r);

    setChartData(mood);
    setActivityData(act);
    setHeatmapItems(mood.map((d) => ({ id: d.label, value: Math.round(d.mood) })));
  };

  useEffect(() => {
    handleRangeChange(range);
    fetchPrediction();
  }, []);

  // ---------------------------
  // Mock generator for fallback
  // ---------------------------
  const generateMock = (r) => {
    if (r === "day") {
      return Array.from({ length: 24 }, (_, h) => ({ label: `${h}:00`, mood: +(3 + Math.random() * 2).toFixed(2) }));
    } else if (r === "week") {
      return Array.from({ length: 7 }, (_, i) => ({ label: `Day-${i + 1}`, mood: +(3 + Math.random() * 2).toFixed(2) }));
    } else if (r === "month") {
      return Array.from({ length: 30 }, (_, i) => ({ label: `D${i + 1}`, mood: +(3 + Math.random() * 2).toFixed(2) }));
    } else if (r === "year") {
      return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => ({
        label: m,
        mood: +(3 + Math.random() * 2).toFixed(2),
        journaling: Math.round(Math.random() * 5)
      }));
    }
    return [];
  };

  // ---------------------------
  // Export PDF
  // ---------------------------
  const exportToPDF = async () => {
    if (!exportRef.current) return;
    const canvas = await html2canvas(exportRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("NeuroWell_Analytics.pdf");
  };

  // ---------------------------
  // Download CSV
  // ---------------------------
  const downloadCSV = () => {
    const rows = [["Label","Mood","Journaling"]];
    chartData.forEach((d,i) => rows.push([d.label, d.mood, activityData[i]?.journaling ?? 0]));
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NeuroWellAnalytics_${range}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const moodColor = (v) => {
    const palette = { 1:"#f6ebe0",2:"#eed6bf",3:"#e3c79b",4:"#caa86c",5:"#b8863e" };
    return palette[Math.round(v)] || "#f6ebe0";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Advanced Analytics — NeuroWellInsight</h1>
        <div className="flex gap-2">
          {["day","week","month","year"].map((r) => (
            <button key={r} onClick={() => handleRangeChange(r)} className={`px-3 py-1 rounded ${range===r ? "bg-gray-900 text-white":"bg-gray-100 text-gray-800"}`}>{r.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <button className="bg-blue-900 text-white px-4 py-2 rounded" onClick={fetchPrediction}>{loadingPrediction ? "Predicting...":"Run Prediction"}</button>
        <button className="bg-gray-800 text-white px-4 py-2 rounded" onClick={exportToPDF}>Export PDF</button>
        <button className="bg-gray-700 text-white px-4 py-2 rounded" onClick={downloadCSV}>Download CSV</button>
      </div>

      <div ref={exportRef} className="space-y-6 bg-white p-6 rounded-2xl shadow">
        {/* Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-gray-50">
            <h3 className="text-gray-700 font-semibold mb-2">Mood Trend ({range})</h3>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6"/>
                  <XAxis dataKey="label" stroke="#6b7280"/>
                  <YAxis domain={[1,5]} stroke="#6b7280"/>
                  <Tooltip/>
                  <Line type="monotone" dataKey="mood" stroke="#1f2937" strokeWidth={3} dot={{r:4}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50">
            <h3 className="text-gray-700 font-semibold mb-2">Activity (Journaling)</h3>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6"/>
                  <XAxis dataKey="label" stroke="#6b7280"/>
                  <YAxis stroke="#6b7280"/>
                  <Tooltip/>
                  <Legend/>
                  <Bar dataKey="journaling" name="Journaling" radius={[6,6,0,0]} fill="#0ea5a4"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="p-4 rounded-xl bg-gray-50">
          <h3 className="font-semibold mb-2">Heatmap ({range})</h3>
          <div className={`grid ${range==="day"?"grid-cols-12":range==="year"?"grid-cols-6":"grid-cols-10"} gap-1`}>
            {heatmapItems.map((cell) => <div key={cell.id} title={`${cell.id}: mood ${cell.value}`} style={{background:moodColor(cell.value)}} className="w-full h-8 rounded-md border"/> )}
          </div>
        </div>

        {/* Prediction */}
        <div className="p-4 rounded-xl bg-gray-50">
          <h3 className="font-semibold mb-2">Prediction</h3>
          {prediction?.server ? <div>{prediction.server.predicted}/5</div> : <div className="text-gray-600 text-sm">No server prediction</div>}
        </div>
      </div>
    </div>
  );
}
