import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

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

function App() {
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

// ==================== HOME TAB ====================
function HomeTab({ user, setUser }) {
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
      <div className="balance-card premium">
        <div className="balance-top">
          <span className="balance-label">মোট ব্যালেন্স</span>
          <span className="balance-indicator">●</span>
        </div>
        <h2 className="balance-amount">৳{user.balance?.toFixed(0)}</h2>
        <div className="balance-divider"></div>
        <div className="balance-stats-grid">
          <StatItem label="আয়" value={`৳${user.totalEarning}`} icon="📈" />
          <StatItem label="ডিপোজিট" value={`৳${user.totalDeposit}`} icon="💰" />
          <StatItem label="উইথড্রো" value={`৳${user.totalWithdraw}`} icon="🏦" />
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="quick-actions-section">
        <div className="section-title">দ্রুত অ্যাকশন</div>
        <div className="quick-actions-grid">
          <ActionButton 
            icon="📅" 
            label="দৈনিক বোনাস" 
            onClick={handleDailyCheckin}
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

// ==================== TEAM TAB ====================
function TeamTab({ user }) {
  const [referralInfo, setReferralInfo] = useState(null);

  useEffect(() => {
    fetchReferralInfo();
  }, []);

  const fetchReferralInfo = async () => {
    try {
      const res = await API.get('/api/referral/info');
      setReferralInfo(res.data);
    } catch (error) {
      console.error('Error fetching referral:', error);
    }
  };

  const copyReferralLink = () => {
    if (referralInfo) {
      navigator.clipboard.writeText(referralInfo.referralLink);
      alert('✅ রেফারেল লিঙ্ক কপি হয়েছে!');
    }
  };

  return (
    <div className="tab-content team-tab">
      <div className="header-section">
        <h2 className="page-title">আপনার টিম</h2>
        <p className="page-subtitle">রেফারেল এবং কমিশন</p>
      </div>

      {referralInfo && (
        <>
          {/* REFERRAL CODE CARD */}
          <div className="referral-code-card">
            <div className="code-title">আপনার রেফারেল কোড</div>
            <div className="code-display">{referralInfo.referralCode}</div>
            <button className="copy-button" onClick={copyReferralLink}>
              📋 লিঙ্ক কপি করুন
            </button>
          </div>

          {/* TEAM STATS */}
          <div className="stats-grid">
            <StatCard 
              title="সরাসরি রেফারেল" 
              value={referralInfo.directReferrals} 
              icon="👥"
              color="green"
            />
            <StatCard 
              title="অর্জিত কমিশন" 
              value={`৳${referralInfo.totalCommission}`} 
              icon="💎"
              color="gold"
            />
          </div>

          {/* COMMISSION INFO */}
          <div className="info-card">
            <div className="info-title">কমিশন কাঠামো</div>
            <div className="info-items">
              <InfoItem label="স্তর ১" value="প্রত্যক্ষ রেফারেল" percent="10%" />
              <InfoItem label="স্তর २" value="আপনার রেফারেলের রেফারেল" percent="5%" />
            </div>
          </div>

          {/* REFERRAL LINK SECTION */}
          <div className="share-section">
            <div className="share-title">শেয়ার করুন</div>
            <div className="share-buttons">
              <ShareButton icon="📲" label="WhatsApp" />
              <ShareButton icon="📧" label="Email" />
              <ShareButton icon="🔗" label="কপি" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ==================== WALLET TAB ====================
function WalletTab({ user, setUser }) {
  const [tab, setTab] = useState('overview');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/api/transactions');
      setTransactions(res.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) < 100) {
      alert('ন্যূনতম ডিপোজিট: ৳100');
      return;
    }

    try {
      const res = await API.post('/api/payment/deposit', {
        amount: parseFloat(depositAmount),
        method: 'sslcommerz'
      });

      setTimeout(async () => {
        await API.post('/api/payment/confirm', {
          transactionId: res.data.transactionId,
          amount: parseFloat(depositAmount)
        });
        
        setUser(prev => ({
          ...prev,
          balance: prev.balance + parseFloat(depositAmount),
          totalDeposit: prev.totalDeposit + parseFloat(depositAmount)
        }));
        
        alert('✅ ডিপোজিট সফল!');
        setDepositAmount('');
        fetchTransactions();
      }, 1000);
    } catch (error) {
      alert('❌ ' + error.response?.data?.error);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) < 200) {
      alert('ন্যূনতম উইথড্রো: ৳200');
      return;
    }

    if (parseFloat(withdrawAmount) > user.balance) {
      alert('অপর্যাপ্ত ব্যালেন্স');
      return;
    }

    try {
      const res = await API.post('/api/payment/withdraw', {
        amount: parseFloat(withdrawAmount),
        method: 'bkash'
      });

      setUser(prev => ({
        ...prev,
        balance: res.data.remainingBalance
      }));

      alert('✅ উইথড্রো অনুরোধ পাঠানো হয়েছে!');
      setWithdrawAmount('');
      fetchTransactions();
    } catch (error) {
      alert('❌ ' + error.response?.data?.error);
    }
  };

  return (
    <div className="tab-content wallet-tab">
      <div className="header-section">
        <h2 className="page-title">ওয়ালেট</h2>
        <p className="page-subtitle">ব্যালেন্স: ৳{user.balance?.toFixed(0)}</p>
      </div>

      {/* WALLET TABS */}
      <div className="wallet-tabs">
        <WalletTabBtn active={tab === 'overview'} onClick={() => setTab('overview')}>
          সারাংশ
        </WalletTabBtn>
        <WalletTabBtn active={tab === 'deposit'} onClick={() => setTab('deposit')}>
          ডিপোজিট
        </WalletTabBtn>
        <WalletTabBtn active={tab === 'withdraw'} onClick={() => setTab('withdraw')}>
          উইথড্রো
        </WalletTabBtn>
        <WalletTabBtn active={tab === 'history'} onClick={() => setTab('history')}>
          ইতিহাস
        </WalletTabBtn>
      </div>

      {/* TAB CONTENT */}
      {tab === 'overview' && (
        <div className="wallet-section">
          <QuickStatCard icon="💰" label="মোট ডিপোজিট" value={`৳${user.totalDeposit}`} />
          <QuickStatCard icon="📊" label="মোট আয়" value={`৳${user.totalEarning}`} />
          <QuickStatCard icon="🏦" label="মোট উইথড্রো" value={`৳${user.totalWithdraw}`} />
        </div>
      )}

      {tab === 'deposit' && (
        <form className="wallet-form" onSubmit={handleDeposit}>
          <div className="form-group">
            <label>পরিমাণ (ন্যূনতম: ৳100)</label>
            <input
              type="number"
              placeholder="৳500"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              min="100"
              required
            />
          </div>
          <button type="submit" className="btn-primary-large">
            ডিপোজিট করুন
          </button>
        </form>
      )}

      {tab === 'withdraw' && (
        <form className="wallet-form" onSubmit={handleWithdraw}>
          <div className="form-group">
            <label>পরিমাণ (ন্যূনতম: ৳200)</label>
            <input
              type="number"
              placeholder="৳500"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              min="200"
              required
            />
          </div>
          <button type="submit" className="btn-primary-large">
            উইথড্রো করুন
          </button>
        </form>
      )}

      {tab === 'history' && (
        <div className="transactions-list">
          {transactions.length === 0 ? (
            <div className="empty-state">কোনো লেনদেন নেই</div>
          ) : (
            transactions.map(tx => (
              <TransactionItem key={tx._id} transaction={tx} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ==================== PROFILE TAB ====================
function ProfileTab({ user, logout }) {
  return (
    <div className="tab-content profile-tab">
      <div className="profile-header">
        <div className="profile-avatar">{user.username.charAt(0).toUpperCase()}</div>
        <h2 className="profile-name">{user.username}</h2>
        <p className="profile-email">{user.email}</p>
      </div>

      {/* PROFILE INFO */}
      <div className="profile-section">
        <ProfileItem label="ব্যবহারকারীর আইডি" value={user._id?.substring(0, 10)} />
        <ProfileItem label="ফোন" value={user.phone || 'যুক্ত করুন'} />
        <ProfileItem label="রেফারেল কোড" value={user.referralCode} />
        <ProfileItem label="যোগদান তারিখ" value={new Date(user.createdAt).toLocaleDateString('bn-BD')} />
      </div>

      {/* ACCOUNT STATS */}
      <div className="profile-stats">
        <ProfileStat label="সরাসরি রেফারেল" value={user.directReferrals?.length || 0} />
        <ProfileStat label="কমিশন অর্জন" value={`৳${user.referralCommissionEarned}`} />
      </div>

      {/* SETTINGS */}
      <div className="profile-section">
        <SettingItem icon="🔐" label="পাসওয়ার্ড পরিবর্তন" />
        <SettingItem icon="🔔" label="নোটিফিকেশন" />
        <SettingItem icon="📱" label="KYC ভেরিফিকেশন" />
        <SettingItem icon="❓" label="সাহায্য ও সমর্থন" />
      </div>

      {/* LOGOUT */}
      <button className="btn-logout" onClick={logout}>
        লগআউট করুন
      </button>
    </div>
  );
}

// ==================== AUTH PAGES ====================

function LoginPage({ setCurrentUser, setIsAuthPage, setLoading }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

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
            <input
              type="password"
              placeholder="আপনার পাসওয়ার্ড"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

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
      </div>
    </div>
  );
}

function RegisterPage({ setCurrentUser, setIsAuthPage, setLoading }) {
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
              placeholder="01700000000"
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

          {error && <div className="error-message">{error}</div>}

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
      </div>
    </div>
  );
}

// ==================== COMPONENTS ====================

function ActionButton({ icon, label, onClick }) {
  return (
    <button className="action-button" onClick={onClick}>
      <div className="action-icon">{icon}</div>
      <div className="action-label">{label}</div>
    </button>
  );
}

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

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon-large">{icon}</div>
      <div className="stat-title">{title}</div>
      <div className="stat-value-large">{value}</div>
    </div>
  );
}

function InfoItem({ label, value, percent }) {
  return (
    <div className="info-item">
      <div className="info-left">
        <div className="info-label">{label}</div>
        <div className="info-desc">{value}</div>
      </div>
      <div className="info-percent">{percent}</div>
    </div>
  );
}

function ShareButton({ icon, label }) {
  return (
    <button className="share-button">
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function QuickStatCard({ icon, label, value }) {
  return (
    <div className="quick-stat-card">
      <div className="quick-stat-icon">{icon}</div>
      <div className="quick-stat-content">
        <div className="quick-stat-label">{label}</div>
        <div className="quick-stat-value">{value}</div>
      </div>
    </div>
  );
}

function TransactionItem({ transaction }) {
  const typeEmoji = {
    deposit: '💰',
    withdraw: '🏦',
    referral: '👥',
    daily_bonus: '🎁',
    package_return: '📈'
  };

  return (
    <div className="transaction-item">
      <div className="tx-icon">{typeEmoji[transaction.type] || '💳'}</div>
      <div className="tx-content">
        <div className="tx-type">{transaction.type}</div>
        <div className="tx-desc">{transaction.method}</div>
      </div>
      <div className={`tx-amount ${transaction.type === 'withdraw' ? 'negative' : ''}`}>
        {transaction.type === 'withdraw' ? '-' : '+'}৳{transaction.amount}
      </div>
    </div>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div className="profile-item">
      <span className="profile-label">{label}</span>
      <span className="profile-value">{value}</span>
    </div>
  );
}

function ProfileStat({ label, value }) {
  return (
    <div className="profile-stat">
      <div className="ps-label">{label}</div>
      <div className="ps-value">{value}</div>
    </div>
  );
}

function SettingItem({ icon, label }) {
  return (
    <button className="setting-item">
      <span>{icon}</span>
      <span>{label}</span>
      <span>›</span>
    </button>
  );
}

function WalletTabBtn({ active, onClick, children }) {
  return (
    <button 
      className={`wallet-tab-btn ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
    </div>
  );
}

export default App;
