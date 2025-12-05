import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Signup.css";

export default function Signup() {
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    navigate("/consent");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="input-group">
            <label>Name</label>
            <input type="text" required />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input type="email" required />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" required />
          </div>

          <button className="auth-btn">Signup</button>
        </form>

        <p className="switch-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
