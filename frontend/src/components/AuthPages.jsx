import React, { useState } from 'react';
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000
});

// ==================== LOGIN PAGE ====================
export function LoginPage({ setCurrentUser, setIsAuthPage, setLoading }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      setCurrentUser(res.data.user);
      alert('✅ লগইন সফল!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'লগইন ব্যর্থ';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">💰 EarningHub</h1>
          <p className="auth-subtitle">আপনার আর্থিক লক্ষ্য অর্জন করুন</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ইমেইল</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>পাসওয়ার্ড</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="আপনার পাসওয়ার্ড"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button 
                type="button"
                className="show-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && <div className="error-message">❌ {error}</div>}

          <button type="submit" className="btn-primary-large">
            লগইন করুন
          </button>
        </form>

        <div className="auth-footer">
          <p>একাউন্ট নেই?</p>
          <button 
            className="auth-link" 
            onClick={() => setIsAuthPage('register')}
          >
            সাইন আপ করুন
          </button>
        </div>

        {/* TEST CREDENTIALS */}
        <div className="test-credentials">
          <p className="test-label">📋 টেস্ট করার জন্য:</p>
          <p>Email: test@example.com</p>
          <p>Password: password123</p>
        </div>
      </div>
    </div>
  );
}

// ==================== REGISTER PAGE ====================
export function RegisterPage({ setCurrentUser, setIsAuthPage, setLoading }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    referralCode: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      setError('পাসওয়ার্ড মিলছে না');
      return;
    }

    if (form.password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে 6 ক্যারেক্টার হতে হবে');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await API.post('/api/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        phone: form.phone,
        referralCode: form.referralCode || undefined
      });
      localStorage.setItem('token', res.data.token);
      setCurrentUser(res.data.user);
      alert(res.data.message);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'রেজিস্ট্রেশন ব্যর্থ';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">💰 EarningHub</h1>
          <p className="auth-subtitle">নতুন অ্যাকাউন্ট তৈরি করুন</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ব্যবহারকারীর নাম</label>
            <input
              type="text"
              placeholder="আপনার নাম"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>ইমেইল</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>পাসওয়ার্ড</label>
            <input
              type="password"
              placeholder="কমপক্ষে 6 ক্যারেক্টার"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>পাসওয়ার্ড নিশ্চিত করুন</label>
            <input
              type="password"
              placeholder="পাসওয়ার্ড পুনরায় প্রবেশ করুন"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>ফোন (ঐচ্ছিক)</label>
            <input
              type="tel"
              placeholder="+880 1X XXX XXXXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>রেফারেল কোড (ঐচ্ছিক)</label>
            <input
              type="text"
              placeholder="বন্ধুর রেফারেল কোড"
              value={form.referralCode}
              onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
            />
          </div>

          {error && <div className="error-message">❌ {error}</div>}

          <button type="submit" className="btn-primary-large">
            একাউন্ট তৈরি করুন
          </button>
        </form>

        <div className="auth-footer">
          <p>ইতিমধ্যে অ্যাকাউন্ট আছে?</p>
          <button 
            className="auth-link" 
            onClick={() => setIsAuthPage('login')}
          >
            লগইন করুন
          </button>
        </div>

        {/* BENEFITS */}
        <div className="benefits-section">
          <p className="benefits-title">✅ সুবিধা:</p>
          <ul className="benefits-list">
            <li>৳1000 স্বাগত বোনাস</li>
            <li>উচ্চ রিটার্ন প্যাকেজ</li>
            <li>10% রেফারেল কমিশন</li>
            <li>দৈনিক বোনাস</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
