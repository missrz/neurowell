import React, { useState } from "react";
import { useSelector } from "react-redux";

// Sections
// import AnimatedBackground from "../components/AnimatedBackground";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import CTA from "../components/CTA";
import Support from "../pages/Support";
import Auth from "../components/Auth";

export default function Home() {
  const [showAuthInline, setShowAuthInline] = useState(false);
  const loggedUser = useSelector(state => state.user.user);

  return (
    <div style={{ position: "relative" }}>
      
      {/* Optional animated bg */}
      {/* <AnimatedBackground /> */}

      {/* ===== HERO ===== */}
      <Hero />

      {/* ===== FEATURES ===== */}
      <Features />

      {/* ===== HOW IT WORKS ===== */}
      <HowItWorks />

       {/* ===== CALL TO ACTION ===== */}
      <CTA onLoginClick={() => setShowAuthInline(true)} />

      {/* ===== SUPPORT / HELPLINE ===== */}
      <Support />

     
      {/* ===== INLINE AUTH (OPTIONAL) ===== */}
      {!loggedUser && showAuthInline && (
        <Auth onClose={() => setShowAuthInline(false)} />
      )}

    </div>
  );
}