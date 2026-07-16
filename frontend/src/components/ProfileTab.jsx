import React from 'react';

export default function ProfileTab({ user, logout }) {
  return (
    <div className="tab-content profile-tab">
      {/* PROFILE HEADER */}
      <ProfileHeader user={user} />

      {/* PROFILE INFO */}
      <ProfileInfoSection user={user} />

      {/* ACCOUNT STATS */}
      <ProfileStatsSection user={user} />

      {/* SETTINGS */}
      <SettingsSection />

      {/* LOGOUT */}
      <button className="btn-logout" onClick={logout}>
        লগআউট করুন
      </button>
    </div>
  );
}

// ==================== PROFILE HEADER ====================
function ProfileHeader({ user }) {
  const getInitial = (name) => name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="profile-header">
      <div className="profile-avatar">{getInitial(user.username)}</div>
      <h2 className="profile-name">{user.username}</h2>
      <p className="profile-email">{user.email}</p>
    </div>
  );
}

// ==================== PROFILE INFO SECTION ====================
function ProfileInfoSection({ user }) {
  const createdDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('bn-BD')
    : 'N/A';

  return (
    <div className="profile-section">
      <ProfileItem 
        label="ব্যবহারকারীর আইডি" 
        value={user._id?.substring(0, 10) + '...'} 
      />
      <ProfileItem 
        label="ফোন" 
        value={user.phone || 'যুক্ত করুন'} 
      />
      <ProfileItem 
        label="রেফারেল কোড" 
        value={user.referralCode} 
      />
      <ProfileItem 
        label="যোগদান তারিখ" 
        value={createdDate} 
      />
    </div>
  );
}

// ==================== PROFILE ITEM ====================
function ProfileItem({ label, value }) {
  return (
    <div className="profile-item">
      <span className="profile-label">{label}</span>
      <span className="profile-value">{value}</span>
    </div>
  );
}

// ==================== PROFILE STATS SECTION ====================
function ProfileStatsSection({ user }) {
  return (
    <div className="profile-stats">
      <ProfileStat 
        label="সরাসরি রেফারেল" 
        value={user.directReferrals?.length || 0} 
      />
      <ProfileStat 
        label="কমিশন অর্জন" 
        value={`৳${user.referralCommissionEarned}`} 
      />
    </div>
  );
}

// ==================== PROFILE STAT ====================
function ProfileStat({ label, value }) {
  return (
    <div className="profile-stat">
      <div className="ps-label">{label}</div>
      <div className="ps-value">{value}</div>
    </div>
  );
}

// ==================== SETTINGS SECTION ====================
function SettingsSection() {
  const settings = [
    { icon: '🔐', label: 'পাসওয়ার্ড পরিবর্তন' },
    { icon: '🔔', label: 'নোটিফিকেশন' },
    { icon: '📱', label: 'KYC ভেরিফিকেশন' },
    { icon: '❓', label: 'সাহায্য ও সমর্থন' },
  ];

  return (
    <div className="profile-section">
      {settings.map((setting, idx) => (
        <SettingItem 
          key={idx}
          icon={setting.icon} 
          label={setting.label} 
        />
      ))}
    </div>
  );
}

// ==================== SETTING ITEM ====================
function SettingItem({ icon, label }) {
  return (
    <button className="setting-item">
      <span>{icon}</span>
      <span>{label}</span>
      <span>›</span>
    </button>
  );
}
