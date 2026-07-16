import React, { useEffect, useState } from 'react';
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

export default function TeamTab({ user }) {
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
          <ReferralCodeCard 
            referralCode={referralInfo.referralCode}
            onCopy={copyReferralLink}
          />

          {/* TEAM STATS */}
          <TeamStats 
            directReferrals={referralInfo.directReferrals}
            totalCommission={referralInfo.totalCommission}
          />

          {/* COMMISSION INFO */}
          <CommissionInfo />

          {/* SHARE SECTION */}
          <ShareSection referralLink={referralInfo.referralLink} />
        </>
      )}
    </div>
  );
}

// ==================== REFERRAL CODE CARD ====================
function ReferralCodeCard({ referralCode, onCopy }) {
  return (
    <div className="referral-code-card">
      <div className="code-title">আপনার রেফারেল কোড</div>
      <div className="code-display">{referralCode}</div>
      <button className="copy-button" onClick={onCopy}>
        📋 লিঙ্ক কপি করুন
      </button>
    </div>
  );
}

// ==================== TEAM STATS ====================
function TeamStats({ directReferrals, totalCommission }) {
  return (
    <div className="stats-grid">
      <StatCard 
        title="সরাসরি রেফারেল" 
        value={directReferrals} 
        icon="👥"
        color="green"
      />
      <StatCard 
        title="অর্জিত কমিশন" 
        value={`৳${totalCommission}`} 
        icon="💎"
        color="gold"
      />
    </div>
  );
}

// ==================== STAT CARD ====================
function StatCard({ title, value, icon, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon-large">{icon}</div>
      <div className="stat-title">{title}</div>
      <div className="stat-value-large">{value}</div>
    </div>
  );
}

// ==================== COMMISSION INFO ====================
function CommissionInfo() {
  return (
    <div className="info-card">
      <div className="info-title">কমিশন কাঠামো</div>
      <div className="info-items">
        <InfoItem 
          label="স্তর ১" 
          value="প্রত্যক্ষ রেফারেল" 
          percent="10%" 
        />
        <InfoItem 
          label="স্তর २" 
          value="আপনার রেফারেলের রেফারেল" 
          percent="5%" 
        />
      </div>
    </div>
  );
}

// ==================== INFO ITEM ====================
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

// ==================== SHARE SECTION ====================
function ShareSection({ referralLink }) {
  const handleWhatsAppShare = () => {
    const message = `আমার সাথে যোগ দিন এবং ৳1000 স্বাগত বোনাস পান!\n\n${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  const handleEmailShare = () => {
    const subject = 'আমাদের সাথে যোগ দিন - EarningHub';
    const body = `আমি আপনাকে EarningHub তে যোগ দিতে আমন্ত্রণ জানাচ্ছি। ৳1000 স্বাগত বোনাস পান!\n\n${referralLink}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    alert('✅ লিঙ্ক কপি হয়েছে!');
  };

  return (
    <div className="share-section">
      <div className="share-title">শেয়ার করুন</div>
      <div className="share-buttons">
        <ShareButton 
          icon="📲" 
          label="WhatsApp" 
          onClick={handleWhatsAppShare}
        />
        <ShareButton 
          icon="📧" 
          label="Email" 
          onClick={handleEmailShare}
        />
        <ShareButton 
          icon="🔗" 
          label="কপি" 
          onClick={handleCopy}
        />
      </div>
    </div>
  );
}

// ==================== SHARE BUTTON ====================
function ShareButton({ icon, label, onClick }) {
  return (
    <button className="share-button" onClick={onClick}>
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
