import React, { useState } from "react";
import { useSelector } from 'react-redux';
// import AnimatedBackground from "../components/AnimatedBackground";
import Hero from "../components/Hero";
import NeuroWellInsight from "../components/NeuroWellInsight";
import Features from "../components/Features";
import CTA from "../components/CTA";
import Contact from "../components/Contact";
import Auth from "../components/Auth";

export default function Home() {
  const [showAuthInline, setShowAuthInline] = useState(false);
  const loggedUser = useSelector(state => state.user.user);

  return (
    <div style={{ position: "relative" }}>
      {/* <AnimatedBackground /> */}
      <Hero />

      {/* Other Home Sections */}
      <NeuroWellInsight />
      <Features />
      <CTA />
      <Contact />
    </div>
  );
}
