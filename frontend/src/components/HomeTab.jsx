import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://earnapp-n5b2.onrender.com',
  timeout: 10000
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function HomeTab({ user, setUser }) {
  const [investments, setInvestments] = useState([]);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invRes, pkgRes] = await Promise.all([
        API.get('/api/investments'),
        API.get('/api/packages')
      ]);
      setInvestments(invRes.data);
      setPackages(pkgRes.data);
      if (pkgRes.data.length === 0) await API.post('/api/seed-packages');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDailyCheckin = async () => {
    try {
      const res = await API.post('/api/checkin', {});
      alert(`✅ আপনি চেক-ইন করেছেন!\n💰 রিওয়ার্ড: ৳${res.data.reward}\n🔥 ধারাবাহিকতা: ${res.data.streak} দিন`);
      setUser(prev => ({
        ...prev,
        balance: res.data.totalBalance,
        totalEarning: prev.totalEarning + res.data.reward
      }));
    } catch (error) {
      alert('⚠️ ' + error.response?.data?.error);
    }
  };

  const activeInvestments = investments.filter(inv => inv.status === 'active');

  return (
    <div className="tab-content home-tab">
      {/* HEADER */}
      <div className="home-header">
        <h1 className="welcome-text">স্বাগতম 👋</h1>
        <p className="username">{user.username}</p>
      </div>

      {/* BALANCE CARD */}
      <BalanceCard balance={user.balance} deposit={user.totalDeposit} earning={user.totalEarning} withdraw={user.totalWithdraw} />

      {/* QUICK ACTIONS */}
      <QuickActions onDailyCheckin={handleDailyCheckin} />

      {/* ACTIVE INVESTMENTS */}
      <div className="investments-section">
        <div className="section-title">সক্রিয় বিনিয়োগ</div>
        {activeInvestments.length === 0 ? (
          <div className="empty-state">
            <p>কোনো সক্রিয় বিনিয়োগ নেই</p>
          </div>
        ) : (
          <div className="investments-list">
            {activeInvestments.map(inv => (
              <InvestmentCard key={inv._id} investment={inv} />
            ))}
          </div>
        )}
      </div>

      {/* AVAILABLE PACKAGES */}
      <div className="packages-section">
        <div className="section-title">উপলব্ধ প্যাকেজ</div>
        <div className="packages-carousel">
          {packages.map(pkg => (
            <PackageCardSmall key={pkg._id} package={pkg} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== BALANCE CARD ====================
function BalanceCard({ balance, deposit, earning, withdraw }) {
  return (
    <div className="balance-card premium">
      <div className="balance-top">
        <span className="balance-label">মোট ব্যালেন্স</span>
        <span className="balance-indicator">●</span>
      </div>
      <h2 className="balance-amount">৳{balance?.toFixed(0)}</h2>
      <div className="balance-divider"></div>
      <div className="balance-stats-grid">
        <StatItem label="আয়" value={`৳${earning}`} icon="📈" />
        <StatItem label="ডিপোজিট" value={`৳${deposit}`} icon="💰" />
        <StatItem label="উইথড্রো" value={`৳${withdraw}`} icon="🏦" />
      </div>
    </div>
  );
}

// ==================== QUICK ACTIONS ====================
function QuickActions({ onDailyCheckin }) {
  return (
    <div className="quick-actions-section">
      <div className="section-title">দ্রুত অ্যাকশন</div>
      <div className="quick-actions-grid">
        <ActionButton 
          icon="📅" 
          label="দৈনিক বোনাস" 
          onClick={onDailyCheckin}
        />
        <ActionButton 
          icon="💳" 
          label="ডিপোজিট" 
          onClick={() => {}}
        />
        <ActionButton 
          icon="🎁" 
          label="প্যাকেজ" 
          onClick={() => {}}
        />
        <ActionButton 
          icon="📊" 
          label="রিপোর্ট" 
          onClick={() => {}}
        />
      </div>
    </div>
  );
}

// ==================== ACTION BUTTON ====================
function ActionButton({ icon, label, onClick }) {
  return (
    <button className="action-button" onClick={onClick}>
      <div className="action-icon">{icon}</div>
      <div className="action-label">{label}</div>
    </button>
  );
}

// ==================== STAT ITEM ====================
function StatItem({ label, value, icon }) {
  return (
    <div className="stat-item">
      <span className="stat-icon">{icon}</span>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

// ==================== INVESTMENT CARD ====================
function InvestmentCard({ investment }) {
  return (
    <div className="investment-card">
      <div className="investment-header">
        <h3 className="investment-name">{investment.packageId?.name}</h3>
        <span className="investment-status">সক্রিয়</span>
      </div>
      <div className="investment-grid">
        <InvItem label="পরিমাণ" value={`৳${investment.investmentAmount}`} />
        <InvItem label="দৈনিক" value={`${investment.dailyReturn}%`} />
        <InvItem label="বাকি" value={`${investment.remainingDays}d`} />
        <InvItem label="অর্জন" value={`৳${investment.totalEarned}`} />
      </div>
    </div>
  );
}

function InvItem({ label, value }) {
  return (
    <div className="inv-item">
      <div className="inv-label">{label}</div>
      <div className="inv-value">{value}</div>
    </div>
  );
}

// ==================== PACKAGE CARD ====================
function PackageCardSmall({ package: pkg }) {
  return (
    <div className="package-card-small">
      <h4 className="package-name">{pkg.name}</h4>
      <div className="package-price">৳{pkg.amount}</div>
      <div className="package-info">
        <div className="info-row">
          <span>ফেরত:</span>
          <strong>{pkg.dailyReturn}% দৈনিক</strong>
        </div>
        <div className="info-row">
          <span>মেয়াদ:</span>
          <strong>{pkg.totalDays} দিন</strong>
        </div>
      </div>
      <button className="btn-small">কিনুন</button>
    </div>
  );
}
