import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from './components/AdminSidebar';
import AdminTopNav from './components/AdminTopNav';
import StatCard from './components/StatCard';
import './admin-styles.css';

const API = axios.create({
  baseURL: 'http://localhost:5000'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AdminDashboard = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    fetchStats();
    verifyAdmin();
  }, []);

  const verifyAdmin = async () => {
    try {
      const response = await API.get('/api/admin/verify');
      setAdminUser(response.data.admin);
    } catch (error) {
      onLogout();
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/admin/dashboard/stats');
      setStats(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load dashboard stats');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <AdminSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Navigation */}
        <AdminTopNav
          adminUser={adminUser}
          onLogout={onLogout}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Page Content */}
        <div className="admin-content">
          {activeMenu === 'dashboard' && (
            <div className="admin-page dashboard-page">
              <div className="page-header">
                <h1>Dashboard</h1>
                <p className="page-subtitle">Welcome back! Here's your platform overview.</p>
              </div>

              {error && (
                <div className="admin-alert alert-error">
                  <span>⚠️</span> {error}
                </div>
              )}

              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Loading dashboard...</p>
                </div>
              ) : stats ? (
                <>
                  {/* Stats Grid */}
                  <div className="stats-grid">
                    <StatCard
                      title="Total Users"
                      value={stats.totalUsers}
                      icon="👥"
                      trend="+12%"
                      color="blue"
                    />
                    <StatCard
                      title="Total Deposits"
                      value={`৳${stats.totalDeposits?.toLocaleString()}`}
                      icon="💰"
                      trend="+8%"
                      color="green"
                    />
                    <StatCard
                      title="Total Withdrawals"
                      value={`৳${stats.totalWithdrawals?.toLocaleString()}`}
                      icon="💳"
                      trend="-3%"
                      color="orange"
                    />
                    <StatCard
                      title="Total Revenue"
                      value={`৳${stats.totalRevenue?.toLocaleString()}`}
                      icon="💎"
                      trend="+15%"
                      color="purple"
                    />
                  </div>

                  {/* Pending Requests */}
                  <div className="pending-section">
                    <div className="pending-card">
                      <div className="pending-icon">⏳</div>
                      <div className="pending-content">
                        <h3>Pending Deposits</h3>
                        <p className="pending-count">{stats.pendingDeposits}</p>
                      </div>
                      <button className="pending-action-btn">Review</button>
                    </div>

                    <div className="pending-card">
                      <div className="pending-icon">⏳</div>
                      <div className="pending-content">
                        <h3>Pending Withdrawals</h3>
                        <p className="pending-count">{stats.pendingWithdrawals}</p>
                      </div>
                      <button className="pending-action-btn">Review</button>
                    </div>

                    <div className="pending-card">
                      <div className="pending-icon">📈</div>
                      <div className="pending-content">
                        <h3>Active Investments</h3>
                        <p className="pending-count">{stats.activeInvestments}</p>
                      </div>
                      <button className="pending-action-btn">View</button>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="recent-activity-section">
                    <div className="section-header">
                      <h2>Recent Transactions</h2>
                      <a href="#" className="view-all-link">View All →</a>
                    </div>
                    <div className="activity-list">
                      <div className="activity-item">
                        <div className="activity-icon">📥</div>
                        <div className="activity-details">
                          <p className="activity-title">New User Registration</p>
                          <p className="activity-time">2 minutes ago</p>
                        </div>
                        <span className="activity-badge success">Success</span>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon">💰</div>
                        <div className="activity-details">
                          <p className="activity-title">Deposit Request Approved</p>
                          <p className="activity-time">15 minutes ago</p>
                        </div>
                        <span className="activity-badge success">Success</span>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon">⏳</div>
                        <div className="activity-details">
                          <p className="activity-title">Withdrawal Request Pending</p>
                          <p className="activity-time">1 hour ago</p>
                        </div>
                        <span className="activity-badge pending">Pending</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Other menu items would render other pages */}
          {activeMenu !== 'dashboard' && (
            <div className="admin-page">
              <div className="page-header">
                <h1>{activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}</h1>
              </div>
              <div className="coming-soon">
                <p>🚀 Page content coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminDashboard;
