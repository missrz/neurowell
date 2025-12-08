import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../styles/NeuroWellInsight.css";

export default function NeuroWellInsight() {
  const features = [
    { title: "AI Detection", desc: "Detect early signs of mental health issues using NLP & emotion AI." },
    { title: "Emotion Tracker", desc: "Track your mood and emotional trends over time." },
    { title: "Personalized Insights", desc: "AI-powered personalized recommendations and micro-tasks." },
    { title: "AI Chatbot", desc: "Instant answers and guidance from our intelligent AI assistant." },
    { title: "Interactive Dashboard", desc: "Visual tracking, analytics, and gamified progress." }
  ];

  return (
    <section className="neurowell-insight py-5">
      <div className="container text-center">
        <h2 className="mb-5 neon-title">NeuroWell Insights</h2>
        <div className="row g-4">
          {features.map((f, i) => (
            <div key={i} className="col-12 col-md-6 col-lg-4">
              <div className="card feature-card h-100 p-4 text-center animate__animated animate__fadeInUp" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="card-body">
                  <h5 className="card-title">{f.title}</h5>
                  <p className="card-text">{f.desc}</p>
                  {/* <a href="#!" className="btn btn-outline-light mt-3 neon-btn">Learn More</a> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
