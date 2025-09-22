import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context'
import axios from '../config/axios.js';

function Register() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { setUser } = useContext(UserContext);

    const navigate = useNavigate();
  
    const handleRegister = (e) => {
      e.preventDefault();
      axios.post('/users/register', {
        email,
        password
      }).then((res) => {
        console.log(res.data);

        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);

        navigate("/");
      }).catch((err) => {
        console.log(err.response.data);
      })
    };
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center">Register</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm">Email</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder='Enter an email'
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Password</label>
              <input
               onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder='Enter your password'
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              Create Account
            </button>
          </form>
          <p className="mt-4 text-sm text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    );
  }

export default Register;