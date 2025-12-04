import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Support.css";

export default function Support() {
  const navigate = useNavigate();

  return (
    <div className="support-container d-flex flex-column justify-content-center align-items-center">
      <button className="btn btn-danger close-btn" onClick={() => navigate("/")}>
        ✕
      </button>

      <h1 className="text-white mb-4 animate__animated animate__fadeInDown">
        Support
      </h1>

      <p className="text-white text-center mb-3 animate__animated animate__fadeIn">
        Welcome to the support page! You can contact us for any assistance regarding the platform.
      </p>

      <div className="support-buttons animate__animated animate__fadeInUp">
        <a href="mailto:support@neurowell.com" className="btn btn-info m-2">
          Email Support
        </a>
        <a href="tel:+1234567890" className="btn btn-info m-2">
          Call Support
        </a>
      </div>

      <p className="text-white mt-5 animate__animated animate__fadeIn">
        We aim to respond within 24 hours.
      </p>
    </div>
  );
}
