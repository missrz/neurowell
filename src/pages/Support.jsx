import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Support.css";

export default function Support() {
  const navigate = useNavigate();

  return (
    <div className="support-container">

    
      <h1 className="support-title">
        Support
      </h1>

      <p className="support-intro">
        Welcome to the support page! You can contact us for any assistance
        regarding the platform.
      </p>

      <div className="support-card-247">
        <div className="support-icon">🧠</div>

        <h3>24×7 Support</h3>

        <p>
          NeuroWell provides 24×7 AI-powered support to guide you anytime.
          Our intelligent NeuroBot helps you manage stress, track moods,
          and stay motivated on your mental wellness journey — making
          support available whenever you need it.
        </p>

        <div className="support-buttons">
          <a href="mailto:support@neurowell.com" className="btn btn-primary m-2">
            Email Support
          </a>

          <a href="tel:+1234567890" className="btn btn-outline-primary m-2">
            Call Support
          </a>
        </div>
      </div>

      <p className="support-footer">
        We aim to respond within 24 hours.
      </p>

    </div>
  );
}