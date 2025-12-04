import React, { useEffect, useState } from "react";
import "../styles/Preloader.css";

export default function Preloader({ onFinish }) {
  const text = "NEUROWELL";
  const [display, setDisplay] = useState("");
  const [fade, setFade] = useState(false);

  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      setDisplay(text.substring(0, index));
      index++;

      if (index > text.length) {
        clearInterval(interval);

        setFade(true);

        setTimeout(() => {
          onFinish();
        }, 600);
      }
    }, 120);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`preloader ${fade ? "fade-out" : ""}`}>
      <h1 className="preloader-text">{display}</h1>
    </div>
  );
}
