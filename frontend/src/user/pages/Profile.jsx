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
};

const Icon = ({ name }) => {
  const paths = {
    back: <path d="m15 18-6-6 6-6M9 12h12" />,
    // settings: (
    //   <>
    //     <circle cx="12" cy="12" r="3" />
    //     {/* <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.08V21h-4v-.08A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.08-.4H3v-4h.08A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.08V3h4v.08A1.7 1.7 0 0 0 15.4 4a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 8.4a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.08.4H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" /> */}
    //   </>
    // ),
    invite: (
      <>
        <circle cx="9" cy="7" r="3" />
        <path d="M3.5 20v-2.5A4.5 4.5 0 0 1 8 13h2a4.5 4.5 0 0 1 4.5 4.5V20M18 8v6M15 11h6" />
      </>
    ),
    deposit: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="3" />
        <path d="M12 8v8M8 12h8" />
      </>
    ),
    card: (
      <>
        <rect x="2.5" y="5" width="19" height="14" rx="3" />
        <path d="M2.5 10h19M6 15h3M12 15h3" />
      </>
    ),
    checkin: <path d="m4 6 2 2 3-4M4 12l2 2 3-4M4 18l2 2 3-4M12 7h8M12 13h8M12 19h8" />,
    history: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5M12 7v5l3 2" />
      </>
    ),
    team: (
      <>
        <circle cx="8" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M2.5 20v-2.5A4.5 4.5 0 0 1 7 13h2a4.5 4.5 0 0 1 4.5 4.5V20M14 14.5a4 4 0 0 1 7.5 2V20H16" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(initialProfile);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("userToken");
  };

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

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

      /*
        Supported response formats:

        {
          success: true,
          user: {}
        }

        {
          success: true,
          data: {
            user: {}
          }
        }

        {
          success: true,
          data: {}
        }
      */

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
          userData.profilePicture ||
          userData.avatar ||
          userData.image ||
          "",
        createdAt: userData.createdAt || "",
        totalEarning: Number(userData.totalEarning || 0),
        previousEarning: Number(
          userData.previousEarning ||
            userData.referralCommissionEarned ||
            userData.referralCommission ||
            0
        ),
      };

      setProfile(normalizedProfile);

      setEditForm({
        name: normalizedProfile.name,
        phone: normalizedProfile.phone,
      });

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...userData,
          ...normalizedProfile,
        })
      );
    } catch (err) {
      console.error(
        "Profile fetch error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load profile"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateProfile = () => {
    if (
      editForm.name.trim().length < 2 ||
      editForm.name.trim().length > 50
    ) {
      return "Name must be 2-50 characters";
    }

    if (
      editForm.phone &&
      !/^(?:\+?880|0)?1[3-9]\d{8}$/.test(
        editForm.phone.trim().replace(/[\s-]/g, "")
      )
    ) {
      return "Enter a valid Bangladesh phone number";
    }

    return "";
  };

  const updateProfile = async (event) => {
    event.preventDefault();

    const validationError = validateProfile();

    if (validationError) {
      showMessage(validationError, "error");
      return;
    }

    try {
      setUpdating(true);

      const token = getToken();

      const payload = {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
      };

      const response = await axios.put(
        `${API_URL}/user/profile`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser =
        response.data?.user ||
        response.data?.data?.user ||
        response.data?.data ||
        payload;

      setProfile((previous) => ({
        ...previous,
        ...updatedUser,
        name: updatedUser.name || payload.name,
        phone: updatedUser.phone || payload.phone,
      }));

      const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          ...updatedUser,
          ...payload,
        })
      );

      setEditMode(false);

      showMessage(
        response.data?.message ||
          "Profile updated successfully"
      );
    } catch (err) {
      console.error(
        "Profile update error:",
        err.response?.data || err.message
      );

      showMessage(
        err.response?.data?.message ||
          "Failed to update profile",
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword) {
      showMessage("Current password is required", "error");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage(
        "New password must be at least 6 characters",
        "error"
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      showMessage("New passwords do not match", "error");
      return;
    }

    if (
      passwordForm.currentPassword ===
      passwordForm.newPassword
    ) {
      showMessage(
        "New password must be different from current password",
        "error"
      );
      return;
    }

    try {
      setChangingPassword(true);

      const token = getToken();

      const response = await axios.put(
        `${API_URL}/user/change-password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordMode(false);

      showMessage(
        response.data?.message ||
          "Password changed successfully"
      );
    } catch (err) {
      console.error(
        "Password change error:",
        err.response?.data || err.message
      );

      showMessage(
        err.response?.data?.message ||
          "Failed to change password",
        "error"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const cancelEdit = () => {
    setEditForm({
      name: profile.name,
      phone: profile.phone,
    });

    setEditMode(false);
  };

  const cancelPasswordChange = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordMode(false);
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/login", {
      replace: true,
    });
  };

  const profileInitial =
    profile.name?.charAt(0)?.toUpperCase() || "U";

  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const services = [
    { label: "Invite", icon: "invite", to: "/team" },
    { label: "Deposit", icon: "deposit", to: "/deposit" },
    { label: "Card", icon: "card", to: "/wallet" },
    { label: "Check in", icon: "checkin", to: "/checkin" },
    { label: "History", icon: "history", to: "/transactions" },
    { label: "Team", icon: "team", to: "/team" },
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

          <button
            type="button"
            className="profile-icon-button"
            onClick={() => {
              setEditMode((previous) => !previous);
              setPasswordMode(false);
            }}
            aria-label="Profile settings"
          >
            <Icon name="settings" />
          </button>
        </header>

        {message && (
          <div
            className={`profile-message ${messageType}`}
            role="alert"
          >
            {message}
          </div>
        )}

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
              <div className="profile-avatar-placeholder">
                {profileInitial}
              </div>
            )}

            <span className="profile-vip-badge">
              <span aria-hidden="true">♛</span>
              VIP 1
            </span>
          </div>

          <div className="profile-overview-content">
            <h1>{profile.name || "User Name"}</h1>
            <p>{profile.phone || "Phone not available"}</p>
          </div>
        </section>

        <section className="profile-earnings" aria-label="Earning summary">
          <div className="profile-earning-row">
            <span>Total earn</span>
            <strong>৳{formatAmount(profile.totalEarning)}</strong>
          </div>
          <div className="profile-earning-row">
            <span>Previous earn</span>
            <strong>৳{formatAmount(profile.previousEarning)}</strong>
          </div>
          <Link to="/withdraw" className="profile-withdraw-button">
            Withdraw
          </Link>
        </section>

        <section className="profile-services">
          <h2>Services</h2>
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

        {editMode && (
          <section className="profile-form-card">
            <div className="profile-section-heading">
              <div>
                <p>Personal information</p>
                <h2>Edit Profile</h2>
              </div>
            </div>

            <form onSubmit={updateProfile}>
              <div className="profile-form-grid">
                <div className="profile-form-group">
                  <label htmlFor="name">Name</label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    placeholder="Enter your name"
                    minLength={2}
                    maxLength={50}
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label htmlFor="phone">Phone Number</label>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    placeholder="01XXXXXXXXX"
                    maxLength={15}
                    required
                  />
                </div>
              </div>

              <div className="profile-form-actions">
                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={cancelEdit}
                  disabled={updating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={updating}
                >
                  {updating
                    ? "Saving Changes..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        )}

        {passwordMode && (
          <section className="profile-form-card">
            <div className="profile-section-heading">
              <div>
                <p>Account security</p>
                <h2>Change Password</h2>
              </div>
            </div>

            <form onSubmit={changePassword}>
              <div className="profile-form-grid">
                <div className="profile-form-group">
                  <label htmlFor="currentPassword">
                    Current Password
                  </label>

                  <input
                    id="currentPassword"
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label htmlFor="newPassword">
                    New Password
                  </label>

                  <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label htmlFor="confirmPassword">
                    Confirm New Password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <div className="profile-form-actions">
                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={cancelPasswordChange}
                  disabled={changingPassword}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={changingPassword}
                >
                  {changingPassword
                    ? "Changing Password..."
                    : "Change Password"}
                </button>
              </div>
            </form>
          </section>
        )}

        <div className="profile-account-actions">
          <button
            type="button"
            className="profile-password-button"
            onClick={() => {
              setPasswordMode((previous) => !previous);
              setEditMode(false);
            }}
          >
            Change password
          </button>
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