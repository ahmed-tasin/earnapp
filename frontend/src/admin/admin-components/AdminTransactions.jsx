import React, { useState } from 'react';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      user: 'User 1',
      type: 'deposit',
      amount: 5000,
      method: 'sslcommerz',
      status: 'completed',
      date: '2024-06-10'
    },
    {
      id: 2,
      user: 'User 2',
      type: 'withdraw',
      amount: 3000,
      method: 'bkash',
      status: 'pending',
      date: '2024-06-10'
    },
    {
      id: 3,
      user: 'User 3',
      type: 'deposit',
      amount: 2000,
      method: 'nagad',
      status: 'completed',
      date: '2024-06-09'
    }
  ]);

  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleApproveTransaction = (id) => {
    setTransactions(transactions.map(tx => 
      tx.id === id ? { ...tx, status: 'completed' } : tx
    ));
    alert('Transaction approved');
  };

  const handleRejectTransaction = (id) => {
    setTransactions(transactions.map(tx => 
      tx.id === id ? { ...tx, status: 'rejected' } : tx
    ));
    alert('Transaction rejected');
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchType = filterType === 'all' || tx.type === filterType;
    const matchStatus = filterStatus === 'all' || tx.status === filterStatus;
    return matchType && matchStatus;
  });

  return (
    <div className="admin-transactions">
      <h2 className="admin-page-title">Transaction Management</h2>

      {/* FILTERS */}
      <div className="admin-controls">
        <div className="filter-group">
          <label>Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>User</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(tx => (
              <tr key={tx.id}>
                <td>#{tx.id}</td>
                <td>{tx.user}</td>
                <td>
                  <span className={`tx-type ${tx.type}`}>
                    {tx.type === 'deposit' ? '💰' : '🏦'} {tx.type.toUpperCase()}
                  </span>
                </td>
                <td className="amount">৳{tx.amount.toLocaleString()}</td>
                <td>{tx.method.toUpperCase()}</td>
                <td>
                  <span className={`status-badge ${tx.status}`}>
                    {tx.status.toUpperCase()}
                  </span>
                </td>
                <td>{tx.date}</td>
                <td className="actions">
                  {tx.status === 'pending' ? (
                    <>
                      <button 
                        className="action-btn approve"
                        onClick={() => handleApproveTransaction(tx.id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="action-btn reject"
                        onClick={() => handleRejectTransaction(tx.id)}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <button className="action-btn view">View</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SUMMARY CARDS */}
      <div className="admin-summary-cards">
        <SummaryCard 
          icon="💰"
          label="Total Deposits" 
          value="৳10,000"
        />
        <SummaryCard 
          icon="🏦"
          label="Total Withdrawals" 
          value="৳3,000"
        />
        <SummaryCard 
          icon="⏳"
          label="Pending" 
          value="1"
        />
      </div>
    </div>
  );
}

// ==================== SUMMARY CARD ====================
function SummaryCard({ icon, label, value }) {
  return (
    <div className="summary-card">
      <span className="summary-icon">{icon}</span>
      <div>
        <div className="summary-label">{label}</div>
        <div className="summary-value">{value}</div>
      </div>
    </div>
  );
}
