import React from "react";
import "../styles/Features.css";
import { BsChatDotsFill, BsHeartPulseFill, BsJournalCheck } from "react-icons/bs";

export default function Features() {
  return (
    <section className="features-section" id="features">
      <div className="container text-center">
        <h2 className="section-title">
          Why <span>NeuroWell?</span>
        </h2>
        <p className="section-subtitle">
          AI-driven emotional intelligence for a healthier mind.
        </p>

        <div className="row mt-5">
          {[
            {
              icon: <BsHeartPulseFill />,
              title: "Early Detection",
              desc: "Analyze text + mood to detect early signs of stress, anxiety or depression.",
            },
            {
              icon: <BsChatDotsFill />,
              title: "AI Support Companion",
              desc: "Friendly chatbot that listens and gives helpful advice anytime.",
            },
            {
              icon: <BsJournalCheck />,
              title: "Smart Mood Journal",
              desc: "Track your emotional health and boost your day with self-care suggestions.",
            },
          ].map((item, i) => (
            <div className="col-md-4 mb-4" key={i}>
              <div className="feature-card">
                <div className="feature-icon">{item.icon}</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
