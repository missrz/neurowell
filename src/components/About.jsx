import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../styles/About.css";

export default function About() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="about-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(13, 13, 13, 0.95)",
        zIndex: 9999,
        overflowY: "auto",
        padding: "50px 20px",
      }}
    >
      {/* CLOSE BUTTON */}
      <button
        className="mood-close-btn btn btn-danger"
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          fontSize: "22px",
          borderRadius: "50%",
          width: "45px",
          height: "45px",
        }}
        onClick={() => navigate("/")}
      >
        ✕
      </button>

      <div
        className="container text-light about-container"
        style={{
          border: "2px solid cyan",
          borderRadius: "15px",
          padding: "25px",
          boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)",
        }}
      >
        {/* TITLE */}
        <h2 className="text-center mb-4" style={{ fontWeight: "700" }}>
          <span style={{ color: "cyan" }}> About </span>
          <span style={{ color: "#ff00ff" }}> NeuroWell </span>
        </h2>

        {/* ABOUT TEXT */}
        <p className="text-center mb-5" style={{ fontSize: "17px", opacity: 0.9 }}>
          NeuroWell is an intelligent mental-wellbeing companion designed to
          help users understand their emotions, identify early signs of stress,
          and stay mentally resilient through AI-driven insights.
        </p>

        <div className="row text-start">
          {/* MISSION */}
          <div className="col-md-6 mb-4">
            <h4 style={{ color: "cyan" }}>Mission</h4>
            <p>
              To make mental health support accessible, stigma-free, and 
              technology-driven — empowering individuals with clarity, 
              emotional awareness, and timely support.
            </p>
          </div>

          {/* VISION */}
          <div className="col-md-6 mb-4">
            <h4 style={{ color: "#ff00ff" }}>Vision</h4>
            <p>
              A future where emotional well-being is continuously monitored,
              supported, and strengthened through safe, ethical, and 
              human-centered AI.
            </p>
          </div>

          {/* GOALS */}
          <div className="col-md-6 mb-4">
            <h4 style={{ color: "cyan" }}>Goals</h4>
            <ul>
              <li>Detect emotional patterns early</li>
              <li>Provide personalized well-being insights</li>
              <li>Promote privacy-first mental health tools</li>
              <li>Encourage healthy behavioral habits</li>
            </ul>
          </div>

          {/* AI MODULES */}
          <div className="col-md-6 mb-4">
            <h4 style={{ color: "#ff00ff" }}>AI Modules</h4>
            <p>
              NeuroWell combines multiple smart systems:
            </p>
            <ul>
              <li><b>Emotion-Aware NLP:</b> Understands tone, mood & sentiment</li>
              <li><b>RAG Knowledge Engine:</b> Uses uploaded datasets for accurate answers</li>
              <li><b>Behavior Insight AI:</b> Detects stress trends from conversations</li>
              <li><b>Adaptive Chatbot:</b> Responds with empathy and guidance</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
