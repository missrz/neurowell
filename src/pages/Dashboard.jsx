import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";

export default function Dashboard() {
  const navigate = useNavigate();

  /* -------------------------- FEATURES LIST -------------------------- */
  const primaryFeatures = [
    { title: "AI Detector", icon: "🧠", desc: "Analyze your mental patterns with AI." },
    { title: "Assessment", icon: "📊", desc: "Take personalized scientific assessment." },
    { title: "Chat / Support", icon: "💬", desc: "Talk to AI Assistant or Support." },
    { title: "Mood Tracker", icon: "😊", desc: "Track your mood trends visually." },
    { title: "Stress Relief Games", icon: "🎮", desc: "Relax with interactive brain games." },
  ];

  const secondaryFeatures = [
    { title: "SOS", icon: "🚨", desc: "Emergency help at one tap." },
    { title: "Journal", icon: "📓", desc: "Write down your daily thoughts." },
    { title: "Settings", icon: "⚙", desc: "Customize your preferences." },
  ];

  const optionalFeatures = [
    { title: "Progress Analytics", icon: "📈", desc: "Visual representation of your growth." },
    { title: "Notifications", icon: "🔔", desc: "Reminder alerts & insights." },
    { title: "Resources & Helplines", icon: "📚", desc: "Professional mental health resources." },
  ];

  /* ---------------------- ROUTE MAP ---------------------- */
  const routeMap = {
    "AI Detector": "/AiDetection",
    "Assessment": "/assessment",
    "Chat / Support": "/chat",
    "Mood Tracker": "/mood-tracker",
    "Stress Relief Games": "/stress-games",
    "SOS": "/SOS",
    "Journal": "/journal",

    "Settings": "/settings",
    "Progress Analytics": "/AdvancedAnalytics",
    "Notifications": "/notifications",
    "Resources & Helplines": "/resources",
  };

  const handleClick = (feat) => {
    const route = routeMap[feat.title];
    if (route) navigate(route);
  };

  return (
    <div
      className="dashboard-container text-light"
      style={{
        background: "linear-gradient(135deg, #080808, #111122, #060606)",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <div className="container py-4">

        {/* HEADER */}
        <h1 className="text-center mb-5 animate_animated animate_fadeInDown dashboard-title">
          {/* <span className="neurowell">NeuroWell</span>
          <div className="dashboard-subtitle">— Dashboard —</div> */}
        </h1>

        {/* --------- MAIN FEATURES --------- */}
        <h3 className="section-title animate_animated animate_fadeInLeft">Main Features</h3>
        <div className="row g-4 mb-5">
          {primaryFeatures.map((feat, i) => (
            <div
              key={i}
              className="col-12 col-md-6 col-lg-4"
              onClick={() => handleClick(feat)}
              style={{ cursor: "pointer" }}
            >
              <div
                className="card feature-card futuristic-card text-center p-4 animate_animated animate_zoomIn"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="feature-icon futuristic-icon mb-3">{feat.icon}</div>
                <h5 className="fw-bold">{feat.title}</h5>
                <p className="card-desc">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* --------- UTILITIES --------- */}
        <h3 className="section-title animate_animated animate_fadeInLeft">Utilities</h3>
        <div className="row g-4 mb-5">
          {secondaryFeatures.map((feat, i) => (
            <div
              key={i}
              className="col-12 col-md-6 col-lg-4"
              onClick={() => handleClick(feat)}
              style={{ cursor: "pointer" }}
            >
              <div className="card feature-card futuristic-card text-center p-4 animate_animated animate_zoomIn">
                <div className="feature-icon futuristic-icon mb-3">{feat.icon}</div>
                <h5 className="fw-bold">{feat.title}</h5>
                <p className="card-desc">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* --------- EXTRA FEATURES --------- */}
        <h3 className="section-title animate_animated animate_fadeInLeft">Extras & Analytics</h3>
        <div className="row g-4 mb-5">
          {optionalFeatures.map((feat, i) => (
            <div
              key={i}
              className="col-12 col-md-6 col-lg-4"
              onClick={() => handleClick(feat)}
              style={{ cursor: "pointer" }}
            >
              <div
                className="card feature-card futuristic-card text-center p-4 animate_animated animate_fadeInUp"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <div className="feature-icon futuristic-icon mb-3">{feat.icon}</div>
                <h5 className="fw-bold">{feat.title}</h5>
                <p className="card-desc">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}