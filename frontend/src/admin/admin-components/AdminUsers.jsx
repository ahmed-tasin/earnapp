import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://earnapp-frontend.onrender.com',
  timeout: 10000
});

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Demo data
      setUsers([
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com',
          balance: 50000,
          totalDeposit: 10000,
          totalEarning: 5000,
          status: 'active',
          joinedDate: '2024-01-15'
        },
        {
          id: 2,
          username: 'user2',
          email: 'user2@example.com',
          balance: 45000,
          totalDeposit: 9000,
          totalEarning: 4500,
          status: 'active',
          joinedDate: '2024-01-16'
        },
        {
          id: 3,
          username: 'user3',
          email: 'user3@example.com',
          balance: 5000,
          totalDeposit: 1000,
          totalEarning: 500,
          status: 'suspended',
          joinedDate: '2024-01-17'
        }
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleSuspendUser = (userId) => {
    if (window.confirm('Are you sure you want to suspend this user?')) {
      setUsers(users.map(u => 
        u.id === userId ? { ...u, status: 'suspended' } : u
      ));
      alert('User suspended successfully');
    }
  };

  const handleActivateUser = (userId) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: 'active' } : u
    ));
    alert('User activated successfully');
  };

  const filteredUsers = users.filter(user => {
    const matchStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchSearch = user.username.includes(searchQuery) || user.email.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  if (loading) return <div className="admin-loading">Loading users...</div>;

  return (
    <div className="admin-users">
      <h2 className="admin-page-title">User Management</h2>

      {/* CONTROLS */}
      <div className="admin-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <FilterBtn 
            active={filterStatus === 'all'}
            onClick={() => setFilterStatus('all')}
          >
            All Users ({users.length})
          </FilterBtn>
          <FilterBtn 
            active={filterStatus === 'active'}
            onClick={() => setFilterStatus('active')}
          >
            Active ({users.filter(u => u.status === 'active').length})
          </FilterBtn>
          <FilterBtn 
            active={filterStatus === 'suspended'}
            onClick={() => setFilterStatus('suspended')}
          >
            Suspended ({users.filter(u => u.status === 'suspended').length})
          </FilterBtn>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Balance</th>
              <th>Total Deposit</th>
              <th>Earnings</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="user-name">{user.username}</td>
                <td>{user.email}</td>
                <td className="balance">৳{user.balance.toLocaleString()}</td>
                <td>৳{user.totalDeposit.toLocaleString()}</td>
                <td>৳{user.totalEarning.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status === 'active' ? '✓' : '✕'} {user.status}
                  </span>
                </td>
                <td>{user.joinedDate}</td>
                <td className="actions">
                  <button className="action-btn view">View</button>
                  {user.status === 'active' ? (
                    <button 
                      className="action-btn suspend"
                      onClick={() => handleSuspendUser(user.id)}
                    >
                      Suspend
                    </button>
                  ) : (
                    <button 
                      className="action-btn activate"
                      onClick={() => handleActivateUser(user.id)}
                    >
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="admin-pagination">
        <button className="pagination-btn">← Previous</button>
        <span className="pagination-info">Page 1 of 10</span>
        <button className="pagination-btn">Next →</button>
      </div>
    </div>
  );
}

// ==================== FILTER BUTTON ====================
function FilterBtn({ active, onClick, children }) {
  return (
    <button 
      className={`filter-btn ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
