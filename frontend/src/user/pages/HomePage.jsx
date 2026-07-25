import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";

import "../styles/HomePage.css";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://earnapp-n5b2.onrender.com/api";

const defaultDashboard = {
  user: {
    username: "User",
    profilePicture: "",
  },

  wallet: {
    balance: 0,
    totalDeposit: 0,
    totalWithdraw: 0,
    totalEarning: 0,
  },

  activeInvestment: null,
  notifications: [],
};

function HomePage() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState(defaultDashboard);

  const [loading, setLoading] =
    useState(true);

  const [checkinLoading, setCheckinLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("userToken")
    );
  };

  const getAuthConfig = () => {
    const token = getToken();

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  }, [navigate]);

  const loadDashboard = useCallback(
    async () => {
      try {
        setLoading(true);
        setMessage("");

        const token = getToken();

        if (!token) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        const response = await axios.get(
          `${API_URL}/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const responseData =
  response.data?.dashboard ||
  response.data?.data?.dashboard ||
  response.data?.data ||
  {};

        setDashboard({
          user: {
            username:
              responseData.user?.username ||
              responseData.username ||
              "User",

            profilePicture:
              responseData.user?.profilePicture ||
              responseData.profilePicture ||
              "",
          },

          wallet: {
            balance:
              responseData.wallet?.balance ??
              responseData.balance ??
              0,

            totalDeposit:
              responseData.wallet?.totalDeposit ??
              responseData.totalDeposit ??
              0,

            totalWithdraw:
              responseData.wallet?.totalWithdraw ??
              responseData.totalWithdraw ??
              0,

            totalEarning:
              responseData.wallet?.totalEarning ??
              responseData.totalEarning ??
              0,
          },

          activeInvestment:
            responseData.activeInvestment ||
            responseData.investment ||
            null,

          notifications:
            responseData.notifications ||
            [],
        });
      } catch (error) {
        console.error(
          "Dashboard load error:",
          error.response?.data ||
            error.message
        );

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          handleLogout();
          return;
        }

        setMessage(
          error.response?.data?.message ||
            "Dashboard data load failed"
        );
      } finally {
        setLoading(false);
      }
    },
    [handleLogout, navigate]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleDailyCheckin = async () => {
    try {
      setCheckinLoading(true);
      setMessage("");

      const response = await axios.post(
        `${API_URL}/checkin`,
        {},
        getAuthConfig()
      );

      setMessage(
        response.data?.message ||
          "Daily check-in successful"
      );

      await loadDashboard();
    } catch (error) {
      console.error(
        "Check-in error:",
        error.response?.data ||
          error.message
      );

      setMessage(
        error.response?.data?.message ||
          "Daily check-in failed"
      );
    } finally {
      setCheckinLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return Number(
      amount || 0
    ).toLocaleString("en-BD");
  };

  const getInitial = () => {
    return (
      dashboard.user?.username
        ?.charAt(0)
        ?.toUpperCase() || "U"
    );
  };

  if (loading) {
    return (
      <div className="user-page-loading">
        <div className="user-loading-spinner" />

        <p>Dashboard loading...</p>
      </div>
    );
  }

  return (
    <div className="user-home-page">
      <header className="user-home-header">
        <div className="user-header-profile">
          {dashboard.user.profilePicture ? (
            <img
              src={
                dashboard.user
                  .profilePicture
              }
              alt="Profile"
              className="user-avatar-image"
            />
          ) : (
            <div className="user-avatar-placeholder">
              {getInitial()}
            </div>
          )}

          <div>
            <span className="user-welcome-text">
              Welcome back
            </span>

            <h1>
              {dashboard.user.username}
            </h1>
          </div>
        </div>

        <button
          type="button"
          className="notification-button"
          onClick={() =>
            navigate("/notifications")
          }
          aria-label="Notifications"
        >
          🔔

          {dashboard.notifications.length >
            0 && (
            <span className="notification-count">
              {
                dashboard.notifications
                  .length
              }
            </span>
          )}
        </button>
      </header>

      {message && (
        <div className="user-home-message">
          {message}
        </div>
      )}

      <section className="wallet-balance-card">
        <div className="wallet-card-top">
          <div>
            <span>Available Balance</span>

            <h2>
              ৳
              {formatMoney(
                dashboard.wallet.balance
              )}
            </h2>
          </div>

          <div className="wallet-icon">
            ৳
          </div>
        </div>

        <div className="wallet-card-actions">
          <button
            type="button"
            onClick={() =>
              navigate("/deposit")
            }
          >
            <span>＋</span>
            Deposit
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/withdraw")
            }
          >
            <span>↗</span>
            Withdraw
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/transactions")
            }
          >
            <span>↔</span>
            History
          </button>
        </div>
      </section>

      <section className="home-stat-grid">
        <div className="home-stat-card">
          <span className="stat-card-icon">
            📥
          </span>

          <div>
            <small>
              Total Deposit
            </small>

            <strong>
              ৳
              {formatMoney(
                dashboard.wallet
                  .totalDeposit
              )}
            </strong>
          </div>
        </div>

        <div className="home-stat-card">
          <span className="stat-card-icon">
            💰
          </span>

          <div>
            <small>
              Total Earning
            </small>

            <strong>
              ৳
              {formatMoney(
                dashboard.wallet
                  .totalEarning
              )}
            </strong>
          </div>
        </div>

        <div className="home-stat-card">
          <span className="stat-card-icon">
            📤
          </span>

          <div>
            <small>
              Total Withdraw
            </small>

            <strong>
              ৳
              {formatMoney(
                dashboard.wallet
                  .totalWithdraw
              )}
            </strong>
          </div>
        </div>

        <div
          className="home-stat-card clickable"
          onClick={() =>
            navigate("/team")
          }
          role="button"
          tabIndex={0}
        >
          <span className="stat-card-icon">
            👥
          </span>

          <div>
            <small>My Team</small>
            <strong>View Team</strong>
          </div>
        </div>
      </section>

      <section className="daily-checkin-card">
        <div>
          <span className="checkin-icon">
            🎁
          </span>

          <div>
            <h3>Daily Reward</h3>

            <p>
              Check in every day and
              collect your reward.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDailyCheckin}
          disabled={checkinLoading}
        >
          {checkinLoading
            ? "Checking..."
            : "Check In"}
        </button>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <h2>Active Investment</h2>

            <p>
              Your running investment
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/packages")
            }
          >
            View all
          </button>
        </div>

        {dashboard.activeInvestment ? (
          <div className="active-investment-card">
            <div className="investment-card-header">
              <div>
                <small>Package</small>

                <h3>
                  {dashboard
                    .activeInvestment
                    .packageId?.name ||
                    dashboard
                      .activeInvestment
                      .package?.name ||
                    dashboard
                      .activeInvestment
                      .packageName ||
                    "Investment Package"}
                </h3>
              </div>

              <span
                className={`investment-status ${
                  dashboard
                    .activeInvestment
                    .status || "active"
                }`}
              >
                {dashboard
                  .activeInvestment
                  .status || "active"}
              </span>
            </div>

            <div className="investment-details-grid">
              <div>
                <small>Invested</small>

                <strong>
                  ৳
                  {formatMoney(
                    dashboard
                      .activeInvestment
                      .investmentAmount ||
                      dashboard
                        .activeInvestment
                        .amount
                  )}
                </strong>
              </div>

              <div>
                <small>
                  Daily Return
                </small>

                <strong>
                  ৳
                  {formatMoney(
                    dashboard
                      .activeInvestment
                      .dailyReturn
                  )}
                </strong>
              </div>

              <div>
                <small>
                  Remaining Days
                </small>

                <strong>
                  {dashboard
                    .activeInvestment
                    .remainingDays ?? 0}
                </strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-investment-card">
            <span>📦</span>

            <h3>
              No active investment
            </h3>

            <p>
              Choose a package to start
              earning.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/packages")
              }
            >
              View Packages
            </button>
          </div>
        )}
      </section>

      <section className="home-section quick-actions-section">
        <div className="home-section-heading">
          <div>
            <h2>Quick Actions</h2>

            <p>
              Access important features
            </p>
          </div>
        </div>

        <div className="quick-action-grid">
          <button
            type="button"
            onClick={() =>
              navigate("/packages")
            }
          >
            <span>📦</span>
            <small>Packages</small>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/team")
            }
          >
            <span>👥</span>
            <small>My Team</small>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/team")
            }
          >
            <span>🔗</span>
            <small>Referral</small>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
          >
            <span>👤</span>
            <small>Profile</small>
          </button>
        </div>
      </section>

      <div className="bottom-navigation-space" />
    </div>
  );
}

export default HomePage;