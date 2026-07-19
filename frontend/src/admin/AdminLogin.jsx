import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './admin-styles.css';

const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      onLoginSuccess(token);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/admin/login', {
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
        onLoginSuccess(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          {/* Header */}
          <div className="admin-login-header">
            <div className="admin-logo">🔐</div>
            <h1 className="admin-login-title">Admin Panel</h1>
            <p className="admin-login-subtitle">Secure Login Access</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="admin-login-form">
            {/* Email Input */}
            <div className="admin-form-group">
              <label htmlFor="email" className="admin-form-label">
                Admin Email
              </label>
              <div className="admin-input-wrapper">
                <span className="admin-input-icon">✉️</span>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-form-input"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="admin-form-group">
              <label htmlFor="password" className="admin-form-label">
                Password
              </label>
              <div className="admin-input-wrapper">
                <span className="admin-input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-form-input"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="admin-show-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="admin-error-message">
                <span>⚠️</span>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="admin-spinner-small"></span>
                  Logging in...
                </>
              ) : (
                'Login to Admin Panel'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="admin-login-footer">
            <p className="admin-footer-text">
              🔒 This is a secure admin area. Unauthorized access is prohibited.
            </p>
            <p className="admin-version-text">Admin Panel v1.0</p>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="admin-login-decoration"></div>
      </div>
    </div>
  );
};

export default AdminLogin;
