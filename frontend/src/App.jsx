import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import AppRoutes from './routes/AppRoutes';
import './App.css';

// ==================== API SETUP ====================
const API = axios.create({
  baseURL: 'https://earnapp-n5b2.onrender.com',  // ✅ Your backend URL
  timeout: 10000
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== MAIN APP ====================
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await API.get('/api/user/profile');
        setCurrentUser(res.data);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes 
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        logout={logout}
      />
    </Router>
  );
}