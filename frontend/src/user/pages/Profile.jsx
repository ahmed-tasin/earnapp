import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import "../styles/Profile.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://earnapp-n5b2.onrender.com/api";

const initialProfile = {
  name: "",
  phone: "",
  referralCode: "",
  role: "user",
  status: "active",
  kycVerified: false,
  profilePicture: "",
  createdAt: "",
  totalEarning: 0,
  previousEarning: 0,
  balance: 0,
  todayEarning: 0,
};

const Icon = ({ name }) => {
  const paths = {
    back: <path d="m15 18-6-6 6-6M9 12h12" />,
    invite: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0M18 8v6M15 11h6" />
      </>
    ),
    deposit: (
      <>
        <rect x="3" y="6" width="18" height="14" rx="3" />
        <path d="M16 11h5M8 13h8M12 9v8" />
      </>
    ),
    card: (
      <>
        <rect x="2.5" y="5" width="19" height="14" rx="3" />
        <path d="M2.5 10h19M6 15h4" />
      </>
    ),
    checkin: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4M16 3v4M3 10h18m-13 5 2 2 5-5" />
      </>
    ),
    history: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    holdings: (
      <>
        <path d="M4 18V9M10 18V5M16 18v-7M22 18V3" />
        <path d="M2 21h21" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
};

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const getToken = () =>
    localStorage.getItem("userToken") || localStorage.getItem("token");

  const fetchProfile = useCallback(async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = getToken();

      if (!token) {
        throw new Error("Please login to view your profile");
      }

      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData =
        response.data?.user ||
        response.data?.data?.user ||
        response.data?.data ||
        response.data ||
        {};

      const normalizedProfile = {
        name: userData.name || userData.username || "",
        phone: userData.phone || "",
        referralCode: userData.referralCode || "",
        role: userData.role || "user",
        status: userData.status || "active",
        kycVerified: Boolean(userData.kycVerified),
        profilePicture:
          userData.profilePicture || userData.avatar || userData.image || "",
        createdAt: userData.createdAt || "",
        totalEarning: Number(userData.totalEarning || 0),
        previousEarning: Number(
          userData.previousEarning ?? userData.previousDayEarning ?? 0,
        ),
        balance: Number(userData.balance || 0),

        todayEarning: Number(userData.todayEarning ?? userData.todayEarn ?? 0),
      };

      setProfile(normalizedProfile);

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...userData,
          ...normalizedProfile,
        }),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Failed to load profile",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/login", { replace: true });
  };

  const profileInitial = profile.name?.charAt(0)?.toUpperCase() || "U";

  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const services = [
    { label: "Invite", icon: "invite", to: "/team" },
    { label: "Deposit", icon: "deposit", to: "/deposit" },
    { label: "Card", icon: "card", to: "/card" },
    { label: "Check in", icon: "checkin", to: "/checkin" },
    { label: "History", icon: "history", to: "/transactions" },
    { label: "Holdings", icon: "holdings", to: "/holdings" },
  ];

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner" />
          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <button
            type="button"
            className="profile-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <Icon name="back" />
          </button>

          <div className="profile-header-copy">
            {/* <p>My account</p> */}
            <h1>Profile</h1>
          </div>

          <span className="profile-header-spacer" aria-hidden="true" />
        </header>

        {error && (
          <div className="profile-error" role="alert">
            <div>
              <strong>Could not load profile</strong>
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() => fetchProfile(true)}
              disabled={refreshing}
            >
              Retry
            </button>
          </div>
        )}

        <section className="profile-overview">
          <div className="profile-avatar-wrapper">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.name || "Profile"}
                className="profile-avatar-image"
              />
            ) : (
              <div className="profile-avatar-placeholder">{profileInitial}</div>
            )}
          </div>

          <div className="profile-overview-content">
            <h1>{profile.name || "User Name"}</h1>
            <p>{profile.phone || "Phone not available"}</p>

            <div className="profile-overview-meta">
              <Link to="/vip" className="profile-vip-badge">
  <span aria-hidden="true">♛</span>
  VIP 1
</Link>

              <span className="profile-active-badge">
                <i aria-hidden="true" />
                {profile.status || "active"}
              </span>
            </div>
          </div>
        </section>
        <section className="profile-earnings" aria-label="Earning summary">
          <div className="profile-earning-row profile-balance-row">
            <span>মোট ব্যালেন্স</span>
            <strong>৳{formatAmount(profile.balance)}</strong>
          </div>

          <div className="profile-earning-row">
            <span>আজকের আয়</span>
            <strong>৳{formatAmount(profile.todayEarning)}</strong>
          </div>

          <div className="profile-earning-row">
            <span>গতকালের আয়</span>
            <strong>৳{formatAmount(profile.previousEarning)}</strong>
          </div>

          <Link to="/withdraw" className="profile-withdraw-button">
            উত্তোলন
          </Link>
        </section>

        <section className="profile-services">
          <div className="profile-services-heading">
            {/* <p>Quick access</p> */}
            <h2>Services</h2>
          </div>

          <div className="profile-services-grid">
            {services.map((service) => (
              <Link
                key={service.label}
                to={service.to}
                className="profile-service-item"
              >
                <span className="profile-service-icon">
                  <Icon name={service.icon} />
                </span>
                <span>{service.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="profile-account-actions">
          <button
            type="button"
            className="profile-logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}

export default Profile;
