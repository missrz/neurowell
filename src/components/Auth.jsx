import React, { useState } from "react";
import "../styles/Auth.css";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true); // toggle Login / Signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple validation example
    if (!email || !password || (!isLogin && !confirmPassword)) {
      setError("Please fill all fields");
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    // TODO: handle login/signup logic
    alert(`${isLogin ? "Login" : "Signup"} submitted`);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">{isLogin ? "Login" : "Sign Up"}</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-text">{error}</div>}

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button type="submit" className="auth-btn">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="switch-text">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <a onClick={() => setIsLogin(false)}>Sign Up</a>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <a onClick={() => setIsLogin(true)}>Login</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
