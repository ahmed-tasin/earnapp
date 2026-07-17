import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://earnapp-frontend.onrender.com',
  timeout: 10000
});

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Demo data - replace with actual API calls
      setStats({
        totalUsers: 1250,
        totalBalance: 250000,
        totalDeposit: 180000,
        totalWithdraw: 95000,
        activeInvestments: 340,
        totalCommission: 45000,
        pendingTransactions: 23,
        completedTransactions: 1205,
        monthlyEarnings: [
          { month: 'Jan', amount: 15000 },
          { month: 'Feb', amount: 18000 },
          { month: 'Mar', amount: 22000 },
          { month: 'Apr', amount: 25000 },
          { month: 'May', amount: 28000 },
          { month: 'Jun', amount: 32000 }
        ],
        topUsers: [
          { id: 1, name: 'User 1', balance: 50000, deposits: 10 },
          { id: 2, name: 'User 2', balance: 45000, deposits: 9 },
          { id: 3, name: 'User 3', balance: 40000, deposits: 8 }
        ],
        recentTransactions: [
          { id: 1, type: 'deposit', user: 'User 1', amount: 5000, status: 'completed' },
          { id: 2, type: 'withdraw', user: 'User 2', amount: 3000, status: 'pending' },
          { id: 3, type: 'deposit', user: 'User 3', amount: 2000, status: 'completed' }
        ]
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-dashboard">
      <h2 className="admin-page-title">Dashboard Overview</h2>

      {/* KEY METRICS */}
      <div className="admin-metrics-grid">
        <MetricCard 
          icon="👥"
          label="Total Users" 
          value={stats.totalUsers}
          color="blue"
        />
        <MetricCard 
          icon="💰"
          label="Total Balance" 
          value={`৳${stats.totalBalance.toLocaleString()}`}
          color="green"
        />
        <MetricCard 
          icon="📈"
          label="Total Deposits" 
          value={`৳${stats.totalDeposit.toLocaleString()}`}
          color="gold"
        />
        <MetricCard 
          icon="🏦"
          label="Total Withdrawals" 
          value={`৳${stats.totalWithdraw.toLocaleString()}`}
          color="red"
        />
        <MetricCard 
          icon="📦"
          label="Active Investments" 
          value={stats.activeInvestments}
          color="purple"
        />
        <MetricCard 
          icon="💎"
          label="Total Commission" 
          value={`৳${stats.totalCommission.toLocaleString()}`}
          color="orange"
        />
      </div>

      {/* CHARTS & DETAILS */}
      <div className="admin-dashboard-grid">
        {/* REVENUE CHART */}
        <div className="admin-card">
          <h3 className="card-title">Monthly Revenue</h3>
          <div className="chart-container">
            <div className="simple-chart">
              {stats.monthlyEarnings.map((data, idx) => (
                <div key={idx} className="chart-bar">
                  <div className="bar" style={{ height: (data.amount / 35000 * 100) + '%' }}></div>
                  <span className="bar-label">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOP USERS */}
        <div className="admin-card">
          <h3 className="card-title">Top Users</h3>
          <div className="users-list">
            {stats.topUsers.map((user) => (
              <div key={user.id} className="user-row">
                <div className="user-info">
                  <div className="user-avatar">{user.name.charAt(0)}</div>
                  <div className="user-details">
                    <div className="user-name">{user.name}</div>
                    <div className="user-meta">{user.deposits} deposits</div>
                  </div>
                </div>
                <div className="user-balance">৳{user.balance.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TRANSACTION STATS */}
      <div className="admin-dashboard-grid-2">
        <div className="admin-card">
          <h3 className="card-title">Transaction Summary</h3>
          <div className="transaction-summary">
            <div className="summary-item">
              <div className="summary-icon">✅</div>
              <div className="summary-text">
                <div className="summary-label">Completed</div>
                <div className="summary-value">{stats.completedTransactions}</div>
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-icon">⏳</div>
              <div className="summary-text">
                <div className="summary-label">Pending</div>
                <div className="summary-value">{stats.pendingTransactions}</div>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="admin-card">
          <h3 className="card-title">Recent Transactions</h3>
          <div className="transactions-list">
            {stats.recentTransactions.map((tx) => (
              <div key={tx.id} className="transaction-row">
                <div className="tx-icon">{tx.type === 'deposit' ? '💰' : '🏦'}</div>
                <div className="tx-details">
                  <div className="tx-type">{tx.type.toUpperCase()}</div>
                  <div className="tx-user">{tx.user}</div>
                </div>
                <div className="tx-amount">৳{tx.amount.toLocaleString()}</div>
                <div className={`tx-status ${tx.status}`}>{tx.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== METRIC CARD ====================
function MetricCard({ icon, label, value, color }) {
  return (
    <div className={`metric-card ${color}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </div>
  );
}
