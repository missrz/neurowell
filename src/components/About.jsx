import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../styles/About.css";

export default function About() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="about-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* CLOSE BUTTON */}
      <button
        className="mood-close-btn"
        onClick={() => navigate("/")}
        aria-label="Close About Page"
      >
        ✕
      </button>

      <div className="about-container">
        {/* LEFT SECTION */}
        <aside className="about-sidebar">
          <h2 className="about-heading">
            <span>About</span> <span>NeuroWell</span>
          </h2>

          <p className="about-desc">
            NeuroWell is an intelligent mental-wellbeing companion designed
            to help users understand emotions, detect stress early, and
            strengthen resilience using AI-driven insights.
          </p>

          <div className="about-info">
            <div className="about-info-item">
              <span>💡</span>
              <p>Accessible mental health support</p>
            </div>
            <div className="about-info-item">
              <span>🔒</span>
              <p>Privacy-first & ethical design</p>
            </div>
          </div>
        </aside>

        {/* RIGHT CARD */}
        <section className="about-card">
          <h3>Our Mission</h3>
          <p className="lead">
            To make mental health support accessible, stigma-free, and
            technology-driven—empowering individuals with clarity,
            emotional awareness, and timely care.
          </p>

          <h3>Vision</h3>
          <p className="lead">
            A future where emotional well-being is continuously supported
            through safe, ethical, and human-centered AI systems.
          </p>

          <div className="about-details">
            <div className="about-item">
              <h4>Goals</h4>
              <ul>
                <li>Detect emotional patterns early</li>
                <li>Provide personalized well-being insights</li>
                <li>Promote privacy-first mental health tools</li>
                <li>Encourage healthy behavioral habits</li>
              </ul>
            </div>

            <div className="about-item">
              <h4>AI Modules</h4>
              <ul>
                <li><b>Emotion-Aware NLP:</b> Tone, mood & sentiment</li>
                <li><b>RAG Knowledge Engine:</b> Accurate contextual answers</li>
                <li><b>Behavior Insight AI:</b> Stress trend detection</li>
                <li><b>Adaptive Chatbot:</b> Empathetic guidance</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}