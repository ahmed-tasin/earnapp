import React, { useState } from 'react';

export default function AdminPackages() {
  const [packages, setPackages] = useState([
    {
      id: 1,
      name: 'Bronze',
      amount: 500,
      dailyReturn: 1,
      totalDays: 30,
      status: 'active'
    },
    {
      id: 2,
      name: 'Silver',
      amount: 1000,
      dailyReturn: 1.5,
      totalDays: 30,
      status: 'active'
    },
    {
      id: 3,
      name: 'Gold',
      amount: 5000,
      dailyReturn: 2,
      totalDays: 30,
      status: 'active'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dailyReturn: '',
    totalDays: ''
  });

  const handleAddPackage = (e) => {
    e.preventDefault();
    
    const newPackage = {
      id: packages.length + 1,
      name: formData.name,
      amount: parseFloat(formData.amount),
      dailyReturn: parseFloat(formData.dailyReturn),
      totalDays: parseInt(formData.totalDays),
      status: 'active'
    };

    setPackages([...packages, newPackage]);
    setFormData({ name: '', amount: '', dailyReturn: '', totalDays: '' });
    setShowForm(false);
    alert('Package added successfully');
  };

  const handleToggleStatus = (id) => {
    setPackages(packages.map(pkg => 
      pkg.id === id 
        ? { ...pkg, status: pkg.status === 'active' ? 'inactive' : 'active' }
        : pkg
    ));
  };

  const handleDeletePackage = (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      setPackages(packages.filter(pkg => pkg.id !== id));
      alert('Package deleted');
    }
  };

  return (
    <div className="admin-packages">
      <h2 className="admin-page-title">Package Management</h2>

      {/* ADD PACKAGE BUTTON */}
      <div className="admin-actions">
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '❌ Cancel' : '➕ Add New Package'}
        </button>
      </div>

      {/* ADD PACKAGE FORM */}
      {showForm && (
        <div className="admin-form-container">
          <form className="admin-form" onSubmit={handleAddPackage}>
            <div className="form-row">
              <div className="form-group">
                <label>Package Name</label>
                <input
                  type="text"
                  placeholder="e.g., Platinum"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount (৳)</label>
                <input
                  type="number"
                  placeholder="e.g., 10000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Daily Return (%)</label>
                <input
                  type="number"
                  placeholder="e.g., 2.5"
                  step="0.1"
                  value={formData.dailyReturn}
                  onChange={(e) => setFormData({ ...formData, dailyReturn: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Total Days</label>
                <input
                  type="number"
                  placeholder="e.g., 30"
                  value={formData.totalDays}
                  onChange={(e) => setFormData({ ...formData, totalDays: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Create Package
            </button>
          </form>
        </div>
      )}

      {/* PACKAGES TABLE */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Daily Return</th>
              <th>Duration</th>
              <th>Total Return</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map(pkg => {
              const totalReturn = (pkg.amount * pkg.dailyReturn * pkg.totalDays) / 100;
              return (
                <tr key={pkg.id}>
                  <td className="package-name">{pkg.name}</td>
                  <td>৳{pkg.amount.toLocaleString()}</td>
                  <td>{pkg.dailyReturn}%</td>
                  <td>{pkg.totalDays} days</td>
                  <td className="total-return">৳{totalReturn.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${pkg.status}`}>
                      {pkg.status === 'active' ? '✓' : '✕'} {pkg.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      className={`action-btn ${pkg.status === 'active' ? 'deactivate' : 'activate'}`}
                      onClick={() => handleToggleStatus(pkg.id)}
                    >
                      {pkg.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeletePackage(pkg.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SUMMARY */}
      <div className="admin-summary-cards">
        <SummaryCard 
          icon="📦"
          label="Total Packages" 
          value={packages.length}
        />
        <SummaryCard 
          icon="✅"
          label="Active" 
          value={packages.filter(p => p.status === 'active').length}
        />
        <SummaryCard 
          icon="💰"
          label="Min Investment" 
          value={`৳${Math.min(...packages.map(p => p.amount)).toLocaleString()}`}
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
