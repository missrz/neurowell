import React from "react";
import "../styles/FeatureCard.css";

export default function FeatureCard({ icon, title, desc, active, onClick }) {
  return (
    <div
      className={`feature-card ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>

      {active && (
        <p className="feature-desc">
          {desc}
        </p>
      )}
    </div>
  );
}
