import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import Components
import HomeTab from './components/HomeTab';
import TeamTab from './components/TeamTab';
import WalletTab from './components/WalletTab';
import ProfileTab from './components/ProfileTab';
import { LoginPage, RegisterPage } from './components/AuthPages';

// Import Styles
import './App.css';

// ==================== API SETUP ====================
const API = axios.create({
  baseURL: 'http://localhost:5000',
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
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [isAuthPage, setIsAuthPage] = useState('login');

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
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setActiveTab('home');
  };

  // AUTH PAGES
  if (!currentUser) {
    return isAuthPage === 'login' ? (
      <LoginPage 
        setCurrentUser={setCurrentUser} 
        setIsAuthPage={setIsAuthPage}
        setLoading={setLoading}
      />
    ) : (
      <RegisterPage 
        setCurrentUser={setCurrentUser} 
        setIsAuthPage={setIsAuthPage}
        setLoading={setLoading}
      />
    );
  }

  // MAIN APP
  return (
    <div className="app-container">
      {/* CONTENT AREA */}
      <div className="content-area">
        {activeTab === 'home' && <HomeTab user={currentUser} setUser={setCurrentUser} />}
        {activeTab === 'team' && <TeamTab user={currentUser} />}
        {activeTab === 'wallet' && <WalletTab user={currentUser} setUser={setCurrentUser} />}
        {activeTab === 'profile' && <ProfileTab user={currentUser} logout={logout} />}
      </div>

      {/* BOTTOM NAVIGATION */}
      <nav className="bottom-nav">
        <NavItem 
          icon="🏠" 
          label="Home" 
          active={activeTab === 'home'}
          onClick={() => setActiveTab('home')}
        />
        <NavItem 
          icon="👥" 
          label="Team" 
          active={activeTab === 'team'}
          onClick={() => setActiveTab('team')}
        />
        <NavItem 
          icon="💳" 
          label="Wallet" 
          active={activeTab === 'wallet'}
          onClick={() => setActiveTab('wallet')}
        />
        <NavItem 
          icon="👤" 
          label="Profile" 
          active={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        />
      </nav>

      {loading && <LoadingOverlay />}
    </div>
  );
}

// ==================== NAV ITEM ====================
function NavItem({ icon, label, active, onClick }) {
  return (
    <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
    </button>
  );
}

// ==================== LOADING OVERLAY ====================
function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
    </div>
  );
}









// Admin Panel Route
import AdminPanel from './admin/AdminPanel';

// In App function, add before return:
const [isAdmin, setIsAdmin] = useState(false);

// Add admin route:
if (isAdmin) {
  return <AdminPanel />;
}

// Add admin access button somewhere (for testing):
<button onClick={() => setIsAdmin(true)}>🔐 Admin</button>