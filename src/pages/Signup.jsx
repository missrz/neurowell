import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Signup.css";
import { useDispatch, useSelector } from 'react-redux';
import { signup, setAuthToken, getStoredAuthToken } from '../services/api';
import { setUser } from '../store/userSlice';

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loggedUser = useSelector(state => state.user.user);
  const [fullName, setFullName] = useState('');
  const [termsAndAccepted, setTermsAndAccepted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (loggedUser) navigate('/');
  }, [loggedUser, navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email || !password) {
      setError('Please fill all fields');
      return;
    }
    try {
      const data = await signup(fullName, email, password, termsAndAccepted);
      setAuthToken(data.token);
      // verify token persisted to cookie/in-memory and use that value
      const stored = getStoredAuthToken() || data.token;
      if (!stored) console.warn('Auth token not persisted after signup');
      dispatch(setUser({ user: data.user, token: stored }));
      navigate('/consent');
    } catch (err) {
      setError(err?.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>

        <form className="auth-form" onSubmit={handleSignup}>
          {error && <div className="error-text">{error}</div>}
          <div className="input-group">
            <label>Full Name</label>
            <input value={fullName} onChange={(e)=>setFullName(e.target.value)} type="text" required />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required />
          </div>

          <div className="input-group">
            <label>Terms and conditions</label>
            <input
              type="checkbox"
              checked={termsAndAccepted}
              onChange={(e) => setTermsAndAccepted(e.target.checked)}
              required
            />
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
