import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

export default function WalletTab({ user, setUser }) {
  const [activeTab, setActiveTab] = useState('overview');
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
        <WalletTabBtn 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
        >
          সারাংশ
        </WalletTabBtn>
        <WalletTabBtn 
          active={activeTab === 'deposit'} 
          onClick={() => setActiveTab('deposit')}
        >
          ডিপোজিট
        </WalletTabBtn>
        <WalletTabBtn 
          active={activeTab === 'withdraw'} 
          onClick={() => setActiveTab('withdraw')}
        >
          উইথড্রো
        </WalletTabBtn>
        <WalletTabBtn 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')}
        >
          ইতিহাস
        </WalletTabBtn>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'overview' && <OverviewTab user={user} />}
      {activeTab === 'deposit' && <DepositTab onSubmit={handleDeposit} depositAmount={depositAmount} setDepositAmount={setDepositAmount} />}
      {activeTab === 'withdraw' && <WithdrawTab onSubmit={handleWithdraw} withdrawAmount={withdrawAmount} setWithdrawAmount={setWithdrawAmount} balance={user.balance} />}
      {activeTab === 'history' && <HistoryTab transactions={transactions} />}
    </div>
  );
}

// ==================== OVERVIEW TAB ====================
function OverviewTab({ user }) {
  return (
    <div className="wallet-section">
      <QuickStatCard 
        icon="💰" 
        label="মোট ডিপোজিট" 
        value={`৳${user.totalDeposit}`} 
      />
      <QuickStatCard 
        icon="📊" 
        label="মোট আয়" 
        value={`৳${user.totalEarning}`} 
      />
      <QuickStatCard 
        icon="🏦" 
        label="মোট উইথড্রো" 
        value={`৳${user.totalWithdraw}`} 
      />
    </div>
  );
}

// ==================== QUICK STAT CARD ====================
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

// ==================== DEPOSIT TAB ====================
function DepositTab({ onSubmit, depositAmount, setDepositAmount }) {
  return (
    <form className="wallet-form" onSubmit={onSubmit}>
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
      <div className="form-group">
        <label>পেমেন্ট পদ্ধতি</label>
        <select className="form-select">
          <option>SSLCommerz (কার্ড)</option>
          <option>bKash</option>
          <option>Nagad</option>
          <option>Rocket</option>
        </select>
      </div>
      <button type="submit" className="btn-primary-large">
        ডিপোজিট করুন
      </button>
    </form>
  );
}

// ==================== WITHDRAW TAB ====================
function WithdrawTab({ onSubmit, withdrawAmount, setWithdrawAmount, balance }) {
  return (
    <form className="wallet-form" onSubmit={onSubmit}>
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
      <div className="form-group">
        <label>পেমেন্ট পদ্ধতি</label>
        <select className="form-select">
          <option>bKash</option>
          <option>Nagad</option>
          <option>Rocket</option>
        </select>
      </div>
      <div className="balance-info">
        <small>বর্তমান ব্যালেন্স: ৳{balance?.toFixed(0)}</small>
      </div>
      <button type="submit" className="btn-primary-large">
        উইথড্রো করুন
      </button>
    </form>
  );
}

// ==================== HISTORY TAB ====================
function HistoryTab({ transactions }) {
  return (
    <div className="transactions-list">
      {transactions.length === 0 ? (
        <div className="empty-state">কোনো লেনদেন নেই</div>
      ) : (
        transactions.map(tx => (
          <TransactionItem key={tx._id} transaction={tx} />
        ))
      )}
    </div>
  );
}

// ==================== TRANSACTION ITEM ====================
function TransactionItem({ transaction }) {
  const typeEmoji = {
    deposit: '💰',
    withdraw: '🏦',
    referral: '👥',
    daily_bonus: '🎁',
    package_return: '📈'
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '🟢';
      case 'pending':
        return '🟡';
      case 'failed':
        return '🔴';
      default:
        return '⚪';
    }
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

// ==================== WALLET TAB BUTTON ====================
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
