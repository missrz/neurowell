import React from "react";
import "../styles/Hero.css";

export default function Hero() {
  return (
    <section className="hero-section" id="home">
      {/* <video className="hero-video" autoPlay muted loop playsInline>
        <source src="/brain1.mp4" type="video/mp4" />
      </video> */}

      <div className="hero-overlay"></div>

      <div className="hero-content container text-center">
        <h1 className="hero-title">
          Neuro<span>Well</span>
        </h1>
        <p className="hero-tagline">
          Early Mental Health Detection & Support Powered by AI
        </p>
        <button className="hero-btn">Start Mental Health Check</button>
      </div>
    </section>
  );
}
