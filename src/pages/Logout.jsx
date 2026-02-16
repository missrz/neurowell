import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout, setAuthToken } from '../services/api';
import { clearUser } from '../store/userSlice';

export default function Logout() {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	useEffect(() => {
		(async () => {
			try {
				await logout();
			} catch (e) {
				// ignore
			}
			setAuthToken(null);
			dispatch(clearUser());
			navigate('/login');
		})();
	}, [dispatch, navigate]);

	return (
		<div style={{ padding: 40 }}>
			<h3>Logging out...</h3>
		</div>
	);
}

