import React, { useState } from 'react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'EarningHub',
    minDeposit: 100,
    minWithdraw: 200,
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
    setSaved(false);
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
    setSaved(true);
  };

  return (
    <div className="admin-settings">
      <h2 className="admin-page-title">System Settings</h2>

      {saved && <div className="success-message">✅ Settings saved successfully!</div>}

      {/* GENERAL SETTINGS */}
      <div className="admin-card">
        <h3 className="card-title">General Settings</h3>
        <div className="settings-form">
          <div className="settings-group">
            <label>Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
            />
          </div>

          <div className="settings-group">
            <label>Maintenance Mode</label>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
              />
              <span>{settings.maintenanceMode ? 'ON' : 'OFF'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT SETTINGS */}
      <div className="admin-card">
        <h3 className="card-title">Payment Settings</h3>
        <div className="settings-form">
          <div className="settings-group">
            <label>Minimum Deposit Amount (৳)</label>
            <input
              type="number"
              value={settings.minDeposit}
              onChange={(e) => handleChange('minDeposit', e.target.value)}
            />
          </div>

          <div className="settings-group">
            <label>Minimum Withdrawal Amount (৳)</label>
            <input
              type="number"
              value={settings.minWithdraw}
              onChange={(e) => handleChange('minWithdraw', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* NOTIFICATION SETTINGS */}
      <div className="admin-card">
        <h3 className="card-title">Notification Settings</h3>
        <div className="settings-form">
          <div className="settings-group">
            <label>Email Notifications</label>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
              />
              <span>{settings.emailNotifications ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>

          <div className="settings-group">
            <label>SMS Notifications</label>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => handleChange('smsNotifications', e.target.checked)}
              />
              <span>{settings.smsNotifications ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT GATEWAY SETTINGS */}
      <div className="admin-card">
        <h3 className="card-title">Payment Gateway Configuration</h3>
        <div className="settings-form">
          <div className="settings-group">
            <label>SSLCommerz Store ID</label>
            <input type="text" placeholder="Enter Store ID" />
          </div>

          <div className="settings-group">
            <label>bKash App Key</label>
            <input type="password" placeholder="Enter App Key" />
          </div>

          <div className="settings-group">
            <label>Nagad Merchant ID</label>
            <input type="text" placeholder="Enter Merchant ID" />
          </div>

          <div className="settings-group">
            <label>Rocket API Key</label>
            <input type="password" placeholder="Enter API Key" />
          </div>
        </div>
      </div>

      {/* BACKUP & MAINTENANCE */}
      <div className="admin-card">
        <h3 className="card-title">Backup & Maintenance</h3>
        <div className="settings-actions">
          <button className="btn-action">
            💾 Create Database Backup
          </button>
          <button className="btn-action">
            📥 Restore Backup
          </button>
          <button className="btn-action warning">
            🗑️ Clear Cache
          </button>
        </div>
      </div>

      {/* ADMIN LOGS */}
      <div className="admin-card">
        <h3 className="card-title">Admin Activity Log</h3>
        <div className="activity-log">
          <LogItem 
            action="User Suspended"
            user="User#123"
            time="2 hours ago"
          />
          <LogItem 
            action="Package Updated"
            user="Gold Package"
            time="4 hours ago"
          />
          <LogItem 
            action="Transaction Approved"
            user="TX#1205"
            time="5 hours ago"
          />
          <LogItem 
            action="Settings Changed"
            user="Min Deposit"
            time="1 day ago"
          />
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="settings-save">
        <button className="btn-primary" onClick={handleSave}>
          ✅ Save All Settings
        </button>
      </div>
    </div>
  );
}

// ==================== LOG ITEM ====================
function LogItem({ action, user, time }) {
  return (
    <div className="log-item">
      <div className="log-content">
        <div className="log-action">{action}</div>
        <div className="log-detail">{user}</div>
      </div>
      <div className="log-time">{time}</div>
    </div>
  );
}
