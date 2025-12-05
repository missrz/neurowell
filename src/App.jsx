import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Preloader from "./components/Preloader";
import Navbar from "./components/Navbar";
import SlidePanel from "./components/SlidePanel";
import Footer from "./components/Footer";
import AnimatedBackground from "./components/AnimatedBackground";
import Dashboard from "./pages/Dashboard";
// Home Components
import Hero from "./components/Hero";
import NeuroWellInsight from "./components/NeuroWellInsight";
import Features from "./components/Features";
import CTA from "./components/CTA";
import Contact from "./components/Contact";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Consent from "./pages/Consent";
import Support from "./pages/Support";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import Chat from "./pages/Chat"; // AI Voice Chat page
import MoodTracker from "./pages/MoodTracker"; // Mood Tracker page
import Assessment from "./pages/Assessment";
import FullChatbotPage from "./pages/FullChatbotPage";
import Source from "./pages/Source";
import SOSSource from "./pages/SOSSource";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Logout from "./pages/Logout";
import AiDetection from "./pages/AiDetection";
// import AIDetection from "./pages/AIDetection";
// import MoodTracker from "./pages/MoodTracker";
// import Insights from "./pages/Insights";
// import Chatbot from "./pages/Chatbot";
// import Dashboard from "./pages/Dashboard";

// Optional inline Auth
import Auth from "./components/Auth";

// Floating Chatbot
import Chatbot from "./components/Chatbot";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [slideOpen, setSlideOpen] = useState(false);
  const [showAuthInline, setShowAuthInline] = useState(false);

  return (
    <>
      {loading ? (
        <Preloader onFinish={() => setLoading(false)} />
      ) : (
        <Router>
          <Navbar onOpenAbout={() => setSlideOpen(true)} />

          <Routes>
            {/* HOME PAGE */}
            <Route
              path="/"
              element={
                <>
                  <AnimatedBackground />
                  <Hero />

                  {/* Inline Login/Register Toggle */}
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
                      }}
                      onClick={() => setShowAuthInline(!showAuthInline)}
                    >
                      {showAuthInline ? "Login/SignUp" : "Login / SignUp"}
                    </button>
                  </div>

                  {showAuthInline && (
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
                      <Auth />
                    </div>
                  )}

                  <NeuroWellInsight />
                  <Features />
                  <CTA />
                  <Contact />
                </>
              }
            />

            {/* AI VOICE CHAT PAGE */}
            <Route path="/chat" element={<Chat />} />

            {/* FULL CHATBOT PAGE */}
            <Route path="/chatbot" element={<FullChatbotPage />} />

            {/* MOOD TRACKER PAGE */}
            <Route path="/journal" element={<MoodTracker />} />

            {/* AUTH PAGES */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/consent" element={<Consent />} /> 

            {/* OTHER PAGES */}
            <Route path="/consent" element={<Consent />} />
            <Route path="/support" element={<Support />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/source" element={<Source />} />
            <Route path="/sos-source" element={<SOSSource />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/aiDetection" element={<AiDetection/>}/>
            <Route path="/AdvancedAnalytics" element={<AdvancedAnalytics/>}/>
            {/* <Route path="/insights" element={<Insights />} /> */}

              

            {/* REDIRECT UNKNOWN ROUTES */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          <Footer />
          <SlidePanel isOpen={slideOpen} onClose={() => setSlideOpen(false)} />

          {/* Floating Chatbot */}
          <Chatbot />
        </Router>
      )}
    </>
  );
}
