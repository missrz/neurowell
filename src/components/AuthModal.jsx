import React, { useState } from "react";
import "../styles/AuthModal.css";

export default function AuthModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();
    window.location.href = "/consent";
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        
        {/* Close Button */}
        <button className="auth-close" onClick={onClose}>×</button>

        <div className="auth-tabs">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>

          <button
            className={!isLogin ? "active" : ""}
            onClick={() => setIsLogin(false)}
          >
            Signup
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          
          {!isLogin && (
            <div className="input-group">
              <label>Name</label>
              <input type="text" required />
            </div>
          )}

          <div className="input-group">
            <label>Email</label>
            <input type="email" required />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" required />
          </div>

          <button className="auth-btn">
            {isLogin ? "Login" : "Signup"}
          </button>
        </form>
      </div>
    </div>
  );
}
