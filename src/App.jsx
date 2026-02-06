import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Preloader from "./components/Preloader";
import Navbar from "./components/Navbar";
import SlidePanel from "./components/SlidePanel";
import Footer from "./components/Footer";
// import AnimatedBackground from "./components/AnimatedBackground";
import Dashboard from "./pages/Dashboard";
// Home Components
import Home from './pages/Home';
import Hero from "./components/Hero";
import NeuroWellInsight from "./components/NeuroWellInsight";
import Features from "./components/Features";
import CTA from "./components/CTA";
import Contact from "./components/Contact";
import About from "./components/About";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Consent from "./pages/Consent";
import Support from "./pages/Support";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import Chat from "./pages/Chat"; // AI Voice Chat page
import MoodTracker from "./pages/MoodTracker"; // Mood Tracker page
import StressGames from "./pages/StressGames";
import Assessment from "./pages/Assessment";
import Journal from "./pages/Journal";
import FullChatbotPage from "./pages/FullChatbotPage";
import SOS from "./pages/SOS";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Logout from "./pages/Logout";
import Resources from "./pages/Resources";
import Notifications from "./pages/Notifications";
import BubbleMergeGame from "./pages/BubbleMergeGame";
import SnakeGame from "./pages/SnakeGame";
import BounceLogicBall from "./pages/BounceLogicBall";
import NightSkyMemoryGame from "./pages/NightSkyMemoryGame";
// import AIDetection from "./pages/AIDetection";
// import MoodTracker from "./pages/MoodTracker";
// import Insights from "./pages/Insights";
// import Chatbot from "./pages/Chatbot";
// import Dashboard from "./pages/Dashboard";

// Optional inline Auth
import Auth from "./components/Auth";

// Floating Chatbot
import Chatbot from "./components/Chatbot";
import { setAuthToken, getMe } from './services/api';
import { useDispatch } from 'react-redux';
import { setUser } from './store/userSlice';
import { useEffect } from 'react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [slideOpen, setSlideOpen] = useState(false);
  const [showAuthInline, setShowAuthInline] = useState(false);
  const loggedUser = useSelector(state => state.user.user);
  const dispatch = useDispatch();

  // restore token from sessionStorage on app start and fetch user
  useEffect(() => {
    try {
      const token = (typeof window !== 'undefined' && window.sessionStorage) ? window.sessionStorage.getItem('authToken') : null;
      if (token) {
        setAuthToken(token);
        getMe().then(res => {
          if (res?.user) dispatch(setUser({ user: res.user, token }));
        }).catch(() => {
          // invalid token, clear
          setAuthToken(null);
          dispatch(setUser({ user: null, token: null }));
        });
      }
    } catch (e) {
      // ignore
    }
  }, [dispatch]);

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
              path="/" element={<Home />} 
            />

            {/* AI VOICE CHAT PAGE */}
            <Route path="/chat" element={<Chat />} />

            {/* FULL CHATBOT PAGE */}
            <Route path="/chatbot" element={<FullChatbotPage />} />

            {/* MOOD TRACKER PAGE */}
            <Route path="/journal" element={<Journal />} />

            {/* AUTH PAGES */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/consent" element={<Consent />} /> 

            {/* OTHER PAGES */}
            <Route path="/about" element={<About />} />
            <Route path="/consent" element={<Consent />} />
            <Route path="/support" element={<Support />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* <Route path="/source" element={<Source />} /> */}
            <Route path="/sos" element={<SOS />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/notify" element={<Notifications />} />

            {/* Mood tracker: support both /journal (existing) and /mood-tracker (dashboard expectation) */}
            <Route path="/mood-tracker" element={<MoodTracker />} />
            <Route path="/stress-games" element={<StressGames />} />
            <Route path="/stress-games/bubble-merge" element={<BubbleMergeGame />} />
            <Route path="/AdvancedAnalytics" element={<AdvancedAnalytics/>}/>
            <Route path="/Resources" element={<Resources />} />

            <Route path="/stress-games/code-breaker" element={<CodeBreakerGame />} />           
            <Route path="/stress-games/snake" element={<SnakeGame />} />
            <Route path="/stress-games/ball" element={<BounceLogicBall />} />
            <Route path="/stress-games/night" element={<NightSkyMemoryGame />} />

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
