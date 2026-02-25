import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";
import { useDispatch } from 'react-redux';
import { login, setAuthToken } from '../services/api';
import { setUser } from '../store/userSlice';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loggedUser = useSelector(state => state.user.user);
  useEffect(() => {
    if (loggedUser) navigate('/Hero');
  }, [loggedUser, navigate]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      setAuthToken(data.token);
      dispatch(setUser({ user: data.user, token: data.token }));
      navigate('/consent');
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>

        <form className="auth-form" onSubmit={handleLogin}>
          {error && <div className="error-text">{error}</div>}
          <div className="input-group">
            <label>Email</label>
            <input className="login-input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input className="login-input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>

          <button className="auth-btn">Login</button>
        </form>

        <p className="switch-text">
          Don’t have an account? <Link to="/signup">Signup</Link>
        </p>
      </div>
    </div>
  );
}
