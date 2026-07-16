import React, { useState } from 'react';

export default function AdminReports() {
  const [dateRange, setDateRange] = useState('month');

  const reports = [
    {
      title: 'User Growth',
      icon: '📈',
      data: '↑ 12.5%',
      description: 'Increase from last month'
    },
    {
      title: 'Revenue Growth',
      icon: '💹',
      data: '↑ 18.3%',
      description: 'Total platform earnings'
    },
    {
      title: 'Active Users',
      icon: '👥',
      data: '850',
      description: 'Users active this week'
    },
    {
      title: 'Conversion Rate',
      icon: '🎯',
      data: '32.5%',
      description: 'Deposit conversion rate'
    }
  ];

  return (
    <div className="admin-reports">
      <h2 className="admin-page-title">Reports & Analytics</h2>

      {/* DATE RANGE SELECTOR */}
      <div className="admin-controls">
        <div className="date-selector">
          <label>Date Range:</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <button className="btn-primary">
          📥 Export Report
        </button>
      </div>

      {/* REPORT CARDS */}
      <div className="admin-reports-grid">
        {reports.map((report, idx) => (
          <div key={idx} className="report-card">
            <div className="report-icon">{report.icon}</div>
            <div className="report-content">
              <h3>{report.title}</h3>
              <div className="report-data">{report.data}</div>
              <p className="report-desc">{report.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* DETAILED REPORTS */}
      <div className="admin-detailed-reports">
        {/* USER STATISTICS */}
        <div className="admin-card">
          <h3 className="card-title">User Statistics</h3>
          <table className="simple-table">
            <tr>
              <td>New Users</td>
              <td className="highlight">156</td>
            </tr>
            <tr>
              <td>Active Users</td>
              <td className="highlight">850</td>
            </tr>
            <tr>
              <td>Inactive Users</td>
              <td>125</td>
            </tr>
            <tr>
              <td>Suspended Users</td>
              <td className="warning">8</td>
            </tr>
          </table>
        </div>

        {/* REVENUE STATISTICS */}
        <div className="admin-card">
          <h3 className="card-title">Revenue Statistics</h3>
          <table className="simple-table">
            <tr>
              <td>Total Deposits</td>
              <td className="highlight">৳180,000</td>
            </tr>
            <tr>
              <td>Total Withdrawals</td>
              <td>৳95,000</td>
            </tr>
            <tr>
              <td>Net Revenue</td>
              <td className="success">৳85,000</td>
            </tr>
            <tr>
              <td>Commission Paid</td>
              <td>৳45,000</td>
            </tr>
          </table>
        </div>

        {/* TRANSACTION STATISTICS */}
        <div className="admin-card">
          <h3 className="card-title">Transaction Statistics</h3>
          <table className="simple-table">
            <tr>
              <td>Total Transactions</td>
              <td className="highlight">1,205</td>
            </tr>
            <tr>
              <td>Completed</td>
              <td className="success">1,182</td>
            </tr>
            <tr>
              <td>Pending</td>
              <td className="warning">23</td>
            </tr>
            <tr>
              <td>Failed</td>
              <td className="error">0</td>
            </tr>
          </table>
        </div>

        {/* INVESTMENT STATISTICS */}
        <div className="admin-card">
          <h3 className="card-title">Investment Statistics</h3>
          <table className="simple-table">
            <tr>
              <td>Active Investments</td>
              <td className="highlight">340</td>
            </tr>
            <tr>
              <td>Total Investment Amount</td>
              <td className="highlight">৳250,000</td>
            </tr>
            <tr>
              <td>Average Investment</td>
              <td>৳735</td>
            </tr>
            <tr>
              <td>Total Returns Paid</td>
              <td className="success">৳32,500</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  );
}
