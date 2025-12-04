import React, { useEffect } from "react"; 
import { Link as RouterLink } from "react-router-dom"; // for routing
import { Link as ScrollLink } from "react-scroll"; // for scrolling
import "../styles/Navbar.css";

export default function Navbar() {
  useEffect(() => {
    const nav = document.querySelector(".neo-nav");

    const handleMove = (e) => {
      let x = (e.clientX / window.innerWidth - 0.5) * 10;
      nav.style.transform = `translate3d(${x}px, 0, 0)`;
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

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
              <ScrollLink
                to={item.link}
                smooth={true}
                duration={600}
                offset={-70}
              >
                {item.name}
              </ScrollLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
