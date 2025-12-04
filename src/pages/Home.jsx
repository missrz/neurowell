import React, { useState } from "react";
import AnimatedBackground from "../components/AnimatedBackground";
import Hero from "../components/Hero";
import NeuroWellInsight from "../components/NeuroWellInsight";
import Features from "../components/Features";
import CTA from "../components/CTA";
import Contact from "../components/Contact";
import Auth from "../components/Auth";

export default function Home() {
  const [showAuthInline, setShowAuthInline] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <AnimatedBackground />
      <Hero />

      {/* Toggle Auth Button */}
      <div style={{ textAlign: "center", margin: "2rem 0" }}>
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#0ff",
            color: "#010101",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
            boxShadow: "0 0 10px #0ff66",
            transition: "0.3s",
          }}
          onClick={() => setShowAuthInline(!showAuthInline)}
        >
          {showAuthInline ? "Hide Login/Register" : "Login / Register"}
        </button>
      </div>

      {/* Inline Auth Component */}
      {showAuthInline && (
        <div
          style={{
            position: "absolute",
            top: "100px", // adjust based on Hero height
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
          }}
        >
          <Auth />
        </div>
      )}

      {/* Other Home Sections */}
      <NeuroWellInsight />
      <Features />
      <CTA />
      <Contact />
    </div>
  );
}
