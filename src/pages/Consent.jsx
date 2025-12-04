import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Consent.css";
import { useNavigate } from "react-router-dom";

export default function Consent() {
  const navigate = useNavigate();

  return (
    <div className="consent-container d-flex justify-content-center align-items-center">
      <div className="consent-card p-4 rounded shadow-lg">
        <h2 className="text-center mb-3 fw-bold">Before You Continue</h2>

        <p className="text-light mb-4 text-center">
          To use <span className="brand">NeuroWell</span>, we need your consent.
        </p>

        <div className="d-grid gap-3 mt-4">
          <button
            className="btn btn-success"
            onClick={() => navigate("/dashboard")}
          >
            I Agree & Continue
          </button>

          <button
            className="btn btn-outline-danger"
            onClick={() => alert("You must accept to use the platform.")}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
