import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import "../styles/Profile.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://earnapp-n5b2.onrender.com/api";

const initialProfile = {
  username: "",
  email: "",
  phone: "",
  referralCode: "",
  role: "user",
  status: "active",
  kycVerified: false,
  profilePicture: "",
  createdAt: "",
};

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(initialProfile);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
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
        username: userData.username || userData.name || "",
        email: userData.email || "",
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
      };

      setProfile(normalizedProfile);

      setEditForm({
        username: normalizedProfile.username,
        email: normalizedProfile.email,
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
    if (!editForm.username.trim()) {
      return "Username is required";
    }

    if (!editForm.email.trim()) {
      return "Email is required";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        editForm.email.trim()
      )
    ) {
      return "Enter a valid email address";
    }

    if (
      editForm.phone &&
      !/^01\d{9}$/.test(editForm.phone.trim())
    ) {
      return "Enter a valid 11-digit phone number";
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
        username: editForm.username.trim(),
        email: editForm.email.trim(),
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
        username:
          updatedUser.username ||
          updatedUser.name ||
          payload.username,
        email: updatedUser.email || payload.email,
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
      username: profile.username,
      email: profile.email,
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

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return new Intl.DateTimeFormat("en-BD", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const profileInitial =
    profile.username?.charAt(0)?.toUpperCase() || "U";

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
          <div>
            <p className="profile-header-label">
              Account settings
            </p>

            <h1>My Profile</h1>
          </div>

          <button
            type="button"
            className="profile-refresh-button"
            onClick={() => fetchProfile(true)}
            disabled={refreshing}
          >
            <span
              className={
                refreshing
                  ? "profile-refresh-icon rotating"
                  : "profile-refresh-icon"
              }
            >
              ↻
            </span>

            {refreshing ? "Refreshing" : "Refresh"}
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

        <section className="profile-overview-card">
          <div className="profile-avatar-wrapper">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.username || "Profile"}
                className="profile-avatar-image"
              />
            ) : (
              <div className="profile-avatar-placeholder">
                {profileInitial}
              </div>
            )}

            <span
              className={
                profile.status === "active"
                  ? "profile-online-indicator active"
                  : "profile-online-indicator"
              }
            />
          </div>

          <div className="profile-overview-content">
            <div className="profile-name-row">
              <h2>{profile.username || "User"}</h2>

              <span
                className={`profile-status status-${String(
                  profile.status
                ).toLowerCase()}`}
              >
                {profile.status}
              </span>
            </div>

            <p>{profile.email || "Email not available"}</p>

            <div className="profile-badges">
              <span className="profile-role-badge">
                {profile.role}
              </span>

              <span
                className={
                  profile.kycVerified
                    ? "profile-kyc-badge verified"
                    : "profile-kyc-badge"
                }
              >
                {profile.kycVerified
                  ? "KYC Verified"
                  : "KYC Not Verified"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="profile-edit-button"
            onClick={() => {
              setEditMode((previous) => !previous);
              setPasswordMode(false);
            }}
          >
            {editMode ? "Close Edit" : "Edit Profile"}
          </button>
        </section>

        <section className="profile-details-grid">
          <article className="profile-detail-card">
            <span>Username</span>
            <strong>{profile.username || "Not available"}</strong>
          </article>

          <article className="profile-detail-card">
            <span>Phone Number</span>
            <strong>{profile.phone || "Not available"}</strong>
          </article>

          <article className="profile-detail-card">
            <span>Referral Code</span>
            <strong>
              {profile.referralCode || "Not available"}
            </strong>
          </article>

          <article className="profile-detail-card">
            <span>Member Since</span>
            <strong>{formatDate(profile.createdAt)}</strong>
          </article>
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
                  <label htmlFor="username">Username</label>

                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={editForm.username}
                    onChange={handleEditChange}
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label htmlFor="email">Email Address</label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    placeholder="Enter email"
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
                    maxLength={11}
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

        <section className="profile-menu-section">
          <div className="profile-section-heading">
            <div>
              <p>Quick access</p>
              <h2>Account Menu</h2>
            </div>
          </div>

          <div className="profile-menu-list">
            <Link to="/wallet" className="profile-menu-item">
              <div className="profile-menu-icon">৳</div>

              <div>
                <strong>My Wallet</strong>
                <span>Balance and account summary</span>
              </div>

              <span className="profile-menu-arrow">›</span>
            </Link>

            <Link
              to="/transactions"
              className="profile-menu-item"
            >
              <div className="profile-menu-icon">↕</div>

              <div>
                <strong>Transactions</strong>
                <span>View account activity</span>
              </div>

              <span className="profile-menu-arrow">›</span>
            </Link>

            <Link
              to="/notifications"
              className="profile-menu-item"
            >
              <div className="profile-menu-icon">🔔</div>

              <div>
                <strong>Notifications</strong>
                <span>View latest updates</span>
              </div>

              <span className="profile-menu-arrow">›</span>
            </Link>

            <button
              type="button"
              className="profile-menu-item"
              onClick={() => {
                setPasswordMode((previous) => !previous);
                setEditMode(false);
              }}
            >
              <div className="profile-menu-icon">🔒</div>

              <div>
                <strong>Change Password</strong>
                <span>Update account security</span>
              </div>

              <span className="profile-menu-arrow">›</span>
            </button>
          </div>
        </section>

        <section className="profile-security-card">
          <div className="profile-security-icon">🛡️</div>

          <div>
            <h3>Keep Your Account Secure</h3>

            <p>
              Never share your password, login token or payment account
              information with anyone.
            </p>
          </div>
        </section>

        <button
          type="button"
          className="profile-logout-button"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </main>
  );
}

export default Profile;