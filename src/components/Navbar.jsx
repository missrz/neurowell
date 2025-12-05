import React, { useEffect } from "react"; 
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom"; // for routing
import "../styles/Navbar.css";

export default function Navbar() {
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

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Home", link: "home", type: "scroll" },
    { name: "Features", link: "features", type: "scroll" },
    { name: "Mood Tracker", link: "/journal", type: "route" },
    { name: "Assessment", link: "/assessment", type: "route" }, // full page route
    { name: "Chat", link: "/chat", type: "route" },
    { name: "Support", link: "/support", type: "route" },
    
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
              <RouterLink to={item.link}>{item.name}</RouterLink>
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
    </nav>
  );
}
