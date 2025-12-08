import React from "react";
import "../styles/CTA.css";
import { useNavigate } from "react-router-dom";

export default function CTA() {
  const navigate = useNavigate();

  const handleStart = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn === "true") {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <section className="cta-section" id="get-started">
      <h2 className="cta-heading">
        Take Control of Your Mental Strength 🧠
      </h2>

      <p className="cta-subtext">
        Your journey toward a healthier and happier mind begins right here. 
        Let's move forward—together.
      </p>

      <button className="cta-button" onClick={handleStart}>
        Begin Your Journey
      </button>
    </section>
  );
}
