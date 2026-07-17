import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './admin-styles.css';

// Admin Components
import AdminDashboard from './admin-components/AdminDashboard';
import AdminUsers from './admin-components/AdminUsers';
import AdminTransactions from './admin-components/AdminTransactions';
import AdminPackages from './admin-components/AdminPackages';
import AdminReports from './admin-components/AdminReports';
import AdminSettings from './admin-components/AdminSettings';

const API = axios.create({
  baseURL: 'https://earnapp-frontend.onrender.com',
  timeout: 10000
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function AdminPanel({ onLogout }) {
  const [adminUser, setAdminUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [isLoginPage, setIsLoginPage] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        // Check if admin still valid
        setAdminUser({ name: 'Admin', email: 'admin@example.com' });
        setIsLoginPage(false);
      } catch (error) {
        localStorage.removeItem('adminToken');
      }
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminUser(null);
    setIsLoginPage(true);
    setActivePage('dashboard');
    if (onLogout) {
      onLogout();
    }
  };

  if (isLoginPage) {
    return <AdminLoginPage setAdminUser={setAdminUser} setIsLoginPage={setIsLoginPage} />;
  }

  return (
    <div className="admin-container">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-left">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1 className="admin-logo">💰 EarningHub Admin</h1>
        </div>
        <div className="admin-header-right">
          <div className="admin-info">
            <span className="admin-name">{adminUser?.name}</span>
            <button className="logout-btn" onClick={handleAdminLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-main">
        {/* SIDEBAR */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <nav className="admin-nav">
            <NavLink 
              icon="📊"
              label="Dashboard" 
              active={activePage === 'dashboard'}
              onClick={() => setActivePage('dashboard')}
            />
            <NavLink 
              icon="👥"
              label="Users" 
              active={activePage === 'users'}
              onClick={() => setActivePage('users')}
            />
            <NavLink 
              icon="💳"
              label="Transactions" 
              active={activePage === 'transactions'}
              onClick={() => setActivePage('transactions')}
            />
            <NavLink 
              icon="📦"
              label="Packages" 
              active={activePage === 'packages'}
              onClick={() => setActivePage('packages')}
            />
            <NavLink 
              icon="📈"
              label="Reports" 
              active={activePage === 'reports'}
              onClick={() => setActivePage('reports')}
            />
            <NavLink 
              icon="⚙️"
              label="Settings" 
              active={activePage === 'settings'}
              onClick={() => setActivePage('settings')}
            />
          </nav>
        </aside>

        {/* CONTENT */}
        <main className="admin-content">
          {activePage === 'dashboard' && <AdminDashboard />}
          {activePage === 'users' && <AdminUsers />}
          {activePage === 'transactions' && <AdminTransactions />}
          {activePage === 'packages' && <AdminPackages />}
          {activePage === 'reports' && <AdminReports />}
          {activePage === 'settings' && <AdminSettings />}
        </main>
      </div>

      {loading && <AdminLoadingOverlay />}
    </div>
  );
}

// ==================== ADMIN LOGIN ====================
function AdminLoginPage({ setAdminUser, setIsLoginPage }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Demo admin login
    if (form.email === 'admin@example.com' && form.password === 'admin123') {
      localStorage.setItem('adminToken', 'demo-admin-token-' + Date.now());
      setAdminUser({ name: 'Admin', email: form.email });
      setIsLoginPage(false);
      alert('✅ Admin Login Successful!');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1>💰 EarningHub</h1>
          <p>Admin Panel</p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="login-form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="admin-login-btn">
            Admin Login
          </button>
        </form>

        <div className="admin-login-footer">
          <p>Demo Credentials:</p>
          <p><strong>Email:</strong> admin@example.com</p>
          <p><strong>Password:</strong> admin123</p>
        </div>
      </div>
    </div>
  );
}

// ==================== NAV LINK ====================
function NavLink({ icon, label, active, onClick }) {
  return (
    <button className={`nav-link ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
    </button>
  );
}

// ==================== LOADING OVERLAY ====================
function AdminLoadingOverlay() {
  return (
    <div className="admin-loading-overlay">
      <div className="admin-spinner"></div>
    </div>
  );
}
