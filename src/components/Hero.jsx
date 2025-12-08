import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import "../styles/Hero.css";

export default function Hero() {
  const navigate = useNavigate();
  const token = useSelector((state) => state.user.token);

  const handleStart = () => {
    // Simple auth check: presence of a token in Redux store (in-memory)
    if (!token) {
      // redirect to login page
      navigate("/login");
      return;
    }
    // if logged in, go to assessment
    navigate("/assessment");
  };

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
      </div>
    </section>
  );
}
