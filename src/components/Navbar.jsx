import { useState, useRef, useEffect } from "react";
import { NavLink, Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import { useSelector } from 'react-redux';
import Logout from './Logout';

export default function Navbar() {
  const [bellOpen, setBellOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const nav = document.querySelector(".neo-nav");
    if (!nav) return;
    
    const handleMove = (e) => {
      let x = (e.clientX / window.innerWidth - 0.5) * 10;
      if (nav && nav.style) nav.style.transform = `translate3d(${x}px, 0, 0)`;
    };
    
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);
  useEffect(() => {
  const handleClickOutside = () => {
    setOpen(false);
    setBellOpen(false);
  };

  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);
  
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(state => state.user.user);
  
  const menuItems = [
    { name: "Home", link: "home", type: "scroll" },
    { name: "Features", link: "/dashboard", type: "route" },
    { name: "Journal", link: "/journal", type: "route" },
    { name: "Assessment", link: "/assessment", type: "route" }, // full page route
    { name: "Chats", link: "/chats", type: "route" },
    { name: "Support", link: "/support", type: "route" },
    { name: "About", link: "/about", type: "route" },
    
  ];
  
  return (
    <nav className="neo-nav">
    <div className="neo-logo">
    Neuro<span>Well</span>
    </div>
    
    <ul className="neo-menu">
    {menuItems.map((item) => (
      <li key={item.name} className="neo-link">
      {item.type === "route" ? (
        <NavLink
        to={item.link}
        className={({ isActive }) =>
          isActive ? "active-link" : ""
      }
      >
      {item.name}
      </NavLink>
    ) : (
      
      <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        
        const doScroll = () => {
          const target = document.getElementById(item.link);
          if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        };
        
        if (location.pathname !== "/") {
          // navigate to home then wait for DOM
          navigate("/");
          // wait a tick for route render
          setTimeout(doScroll, 300);
        } else {
          doScroll();
        }
      }}
      >
      {item.name}
      </a>
    )}
    </li>
  ))}
  </ul>
  <div className="neo-auth">
    {/* 🔔 Notification Bell */}
<div
  className="neo-bell"
  onClick={(e) => {
    e.stopPropagation();
    setBellOpen(!bellOpen);
  }}
>
  🔔
  <span className="neo-bell-pulse"></span>

  {bellOpen && (
    <div className="neo-dropdown neo-bell-dropdown">
      <p className="neo-notification">💙 You logged your mood</p>
      <p className="neo-notification">🧠 New assessment available</p>
      <p className="neo-notification muted">No more notifications</p>
    </div>
  )}
</div>
  
  {user ? (
    <div className="neo-profile" ref={dropdownRef}>
    {user?.profileImage ? (
      <img
      src={user.profileImage}
      alt="profile"
      className="neo-avatar"
      onClick={(e) => {
        e.stopPropagation();   // 🔥 HERE
        setOpen(!open);
      }}
      />
    ) : (
      <div
      className="neo-avatar neo-avatar-initial"
      onClick={(e) => {
        e.stopPropagation();   // 🔥 HERE
        setOpen(!open);
      }}
      >
      {(user.fullName || user.email).charAt(0).toUpperCase()}
      </div>
        )}
    
    {open && (
      <div className="neo-dropdown neo-dropdown-right">
      <RouterLink to="/AdvancedAnalytics">Dashboard</RouterLink>
      <RouterLink to="/settings">Settings</RouterLink>
      <button
      className="neo-logout-btn"
      onClick={() => setOpen(false)}
      >
      <Logout />
      </button>
      </div>
    )}
    </div>
  ) : (
    <div className="neo-login-links">
    <RouterLink to="/login">Login</RouterLink>
    <RouterLink to="/signup" style={{ marginLeft: 12 }}>
    Sign Up
    </RouterLink>
    </div>
  )}
  </div>
  </nav>
);
}
