// src/pages/Features.jsx
import React from "react";
import { FaBrain, FaComments, FaChartLine, FaShieldAlt, FaUserMd, FaMobileAlt } from "react-icons/fa";
import "../styles/Features.css";

export default function Features() {
  const features = [
    {
      icon: <FaBrain />,
      title: "AI Mental Analysis",
      desc: "Advanced AI models analyze emotional patterns and early mental health indicators."
    },
    {
      icon: <FaComments />,
      title: "Smart Chat Support",
      desc: "Conversational AI provides safe, guided, and empathetic interactions."
    },
    {
      icon: <FaChartLine />,
      title: "Progress Tracking",
      desc: "Visual dashboards to monitor mood trends and improvement over time."
    },
    {
      icon: <FaShieldAlt />,
      title: "Privacy First",
      desc: "Secure data handling and privacy-focused architecture."
    },
    {
      icon: <FaUserMd />,
      title: "Expert Guidance",
      desc: "Helpline & professional support integration."
    },
    {
      icon: <FaMobileAlt />,
      title: "Cross Platform",
      desc: "Works across web and mobile for continuous support."
    }
  ];

  return (
    <section className="features-section" id="features">
      <div className="features-header">
        <h2>
          Powerful <span>NeuroWell Features</span>
        </h2>
        <p>
          Designed to support early mental health detection with AI precision
          and human-centric care.
        </p>
      </div>

      <div className="features-grid">
        {features.map((f, i) => (
          <div className="feature-card" key={i}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}