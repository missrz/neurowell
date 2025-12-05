import React from "react";
import { useNavigate } from "react-router-dom";
import FeatureCard from "./FeatureCard";
import "../styles/NeuroWellInsight.css";

export default function NeuroWellInsight() {
  const navigate = useNavigate();

  const items = [
    { 
      title: "AI Detection", 
      desc: "Detect early signs of mental health issues using NLP and emotion analysis.",
      route: "/ai-detection"
    },
    { 
      title: "Emotion Tracker", 
      desc: "Track mood and emotional trends over time.",
      route: "/moodtracker"
    },
    { 
      title: "Personalized Insights", 
      desc: "Tailored recommendations and micro-tasks.",
      route: "/insights"
    },
    { 
      title: "AI Chatbot", 
      desc: "Interact with our intelligent AI assistant for instant answers and tips.",
      route: "/chatbot"
    },
    { 
      title: "Interactive Dashboard", 
      desc: "Visual tracking & gamified progress.",
      route: "/dashboard"
    }
  ];

  return (
    <section className="neurowell-insight">
      <h2>NeuroWell Insights</h2>

      <div className="insight-grid">
        {items.map((it, i) => (
          <div 
            key={i}
            onClick={() => navigate(it.route)}
            style={{ cursor: "pointer" }}
          >
            <FeatureCard title={it.title} desc={it.desc} />
          </div>
        ))}
      </div>
    </section>
  );
}
