import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";

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
import ChatsPage from './pages/ChatsPage';
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
import { setAuthToken, getMe, getStoredAuthToken } from './services/api';
import { useDispatch } from 'react-redux';
import { setUser } from './store/userSlice';
import { useEffect } from 'react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [slideOpen, setSlideOpen] = useState(false);
  const [showAuthInline, setShowAuthInline] = useState(false);
  const loggedUser = useSelector(state => state.user.user);
  const dispatch = useDispatch();

  // restore token from cookie on app start and fetch user
  useEffect(() => {
    try {
      const token = getStoredAuthToken();
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
        (() => {
          const RootLayout = () => (
            <>
              <Navbar onOpenAbout={() => setSlideOpen(true)} />
              <Outlet />
              <Footer />
              <SlidePanel isOpen={slideOpen} onClose={() => setSlideOpen(false)} />
              <Chatbot />
            </>
          );

          const router = createBrowserRouter([
            {
              path: "/",
              element: <RootLayout />,
              children: [
                { index: true, element: <Home /> },
                { path: "chat", element: <Chat /> },
                { path: "chats", element: <ChatsPage /> },
                { path: "chats/:chatId", element: <ChatsPage /> },
                { path: "chatbot", element: <FullChatbotPage /> },
                { path: "journal", element: <Journal /> },
                { path: "login", element: <Login /> },
                { path: "signup", element: <Signup /> },
                { path: "consent", element: <Consent /> },
                { path: "about", element: <About /> },
                { path: "support", element: <Support /> },
                { path: "assessment", element: <Assessment /> },
                { path: "dashboard", element: <Dashboard /> },
                { path: "sos", element: <SOS /> },
                { path: "settings", element: <Settings /> },
                { path: "admin", element: <Admin /> },
                { path: "logout", element: <Logout /> },
                { path: "notifications", element: <Notifications /> },
                { path: "mood-tracker", element: <MoodTracker /> },
                { path: "stress-games", element: <StressGames /> },
                { path: "AdvancedAnalytics", element: <AdvancedAnalytics /> },
                { path: "Resources", element: <Resources /> },
                { path: "stress-games/snake", element: <SnakeGame /> },
                { path: "stress-games/ball", element: <BounceLogicBall /> },
                { path: "stress-games/night", element: <NightSkyMemoryGame /> },
                { path: "*", element: <Navigate to="/" /> },
              ],
            },
          ], { future: { v7_startTransition: true, v7_relativeSplatPath: true } });

          return <RouterProvider router={router} future={{ v7_startTransition: true, v7_relativeSplatPath: true }} />;
        })()
      )}
    </>
  );
}
