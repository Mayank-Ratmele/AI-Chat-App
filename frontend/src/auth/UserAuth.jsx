import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';

const UserAuth = ({ children }) => {
	const nav = useNavigate();

	const { user } = useContext(UserContext);
	const [loading, setLoading] = useState(true);
	const token = localStorage.getItem('token');

	useEffect(() => {

		if (user) {
			setLoading(false);
		}

		if (!token) {
			nav('/login');
		}

		if (!user) {
			nav('/login');
		}
	}, []);

	if (loading) {
		return <div>Loading...</div>
	}

	return (
		<>
			{children}
		</>
	)
}

export default UserAuth;