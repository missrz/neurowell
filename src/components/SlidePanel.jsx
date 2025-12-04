import React from "react";
import "../styles/SlidePanel.css";

export default function SlidePanel({ isOpen, onClose }) {
  return (
    <div className={`slide-panel ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
      <div className="slide-inner">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>NeuroWell — Deep Dive</h2>

        <section>
          <h3>Mission</h3>
          <p>Decrease stigma, increase resilience, and provide accessible mental health support using AI.</p>

          <h3>Vision</h3>
          <p>Personalized, continuous mental wellbeing for everyone through ethical AI.</p>

          <h3>Goals</h3>
          <ul>
            <li>Early detection using NLP & Emotion AI</li>
            <li>Behavioral analytics to personalize care</li>
            <li>Privacy-first data handling</li>
          </ul>

          <h3>AI Modules</h3>
          <p>Text-based NLP, voice features, emotion recognition, and behavior analytics combined for early warnings and recommendations.</p>

          <h3>Team</h3>
          <p>Dr. Mohammad Nasiruddin, Aliza Umam Khatib, Roshani Dossani, Saniya Khan, Shreeya Sapate</p>
        </section>
      </div>
    </div>
  );
}
