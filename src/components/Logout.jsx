import React from 'react';
import { useDispatch } from 'react-redux';
import { clearUser } from '../store/userSlice';
import { logout, setAuthToken } from '../services/api';

export default function Logout() {
  const dispatch = useDispatch();
  const handleLogout = async () => {
    await logout();
    setAuthToken(null);
    dispatch(clearUser());
  };

  return (
    <button className="auth-btn" onClick={handleLogout}>
      Logout
    </button>
  );
}
