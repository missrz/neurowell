import React from "react";
import "../styles/FeatureModuleCard.css";

export default function FeatureModuleCard({ title, desc }) {
  return (
    <div className="feature-module-card">
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}
