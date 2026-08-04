import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import "../styles/Wallet.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://earnapp-n5b2.onrender.com/api";

const defaultWallet = {
  balance: 0,
  totalDeposit: 0,
  totalWithdraw: 0,
  totalEarning: 0,
  referralCommissionEarned: 0,
};

const walletActions = [
  {
    label: "Deposit",
    icon: "＋",
    to: "/deposit",
    tone: "deposit",
  },
  {
    label: "Withdraw",
    icon: "↗",
    to: "/withdraw",
    tone: "withdraw",
  },
  {
    label: "History",
    icon: "↕",
    to: "/transactions",
    tone: "history",
  },
  {
    label: "Packages",
    icon: "◇",
    to: "/packages",
    tone: "package",
  },
];

function Wallet() {
  const [wallet, setWallet] = useState(defaultWallet);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-BD", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  const fetchWallet = useCallback(async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token =
        localStorage.getItem("userToken") ||
        localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login to view your wallet");
      }

      const response = await axios.get(`${API_URL}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dashboardData =
        response.data?.dashboard ||
        response.data?.data?.dashboard ||
        response.data?.wallet ||
        response.data?.data?.wallet ||
        response.data?.data ||
        {};

      const walletData = dashboardData.wallet || dashboardData;

      setWallet({
        balance: walletData.balance ?? 0,
        totalDeposit: walletData.totalDeposit ?? 0,
        totalWithdraw: walletData.totalWithdraw ?? 0,
        totalEarning: walletData.totalEarning ?? 0,
        referralCommissionEarned:
          walletData.referralCommissionEarned ??
          walletData.referralCommission ??
          0,
      });
    } catch (requestError) {
      console.error(
        "Wallet fetch error:",
        requestError.response?.data || requestError.message
      );

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Failed to load wallet information"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const walletSummary = [
    {
      label: "Total deposit",
      value: wallet.totalDeposit,
      icon: "↓",
      tone: "deposit",
    },
    {
      label: "Total withdraw",
      value: wallet.totalWithdraw,
      icon: "↑",
      tone: "withdraw",
    },
    {
      label: "Total earning",
      value: wallet.totalEarning,
      icon: "＋",
      tone: "earning",
    },
    {
      label: "Referral income",
      value: wallet.referralCommissionEarned,
      icon: "↗",
      tone: "referral",
    },
  ];

  if (loading) {
    return (
      <main className="wallet-page">
        <div className="wallet-container">
          <div className="wallet-loading">
            <div className="wallet-spinner" />
            <p>Loading wallet...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="wallet-page">
      <div className="wallet-container">
        <header className="wallet-header">
          <div>
            {/* <p className="wallet-header-label">My account</p> */}
            <h1>Wallet</h1>
          </div>

          <button
            type="button"
            className="wallet-refresh-button"
            onClick={() => fetchWallet(true)}
            disabled={refreshing}
            aria-label="Refresh wallet"
          >
            <span
              className={
                refreshing
                  ? "wallet-refresh-icon rotating"
                  : "wallet-refresh-icon"
              }
              aria-hidden="true"
            >
              ↻
            </span>
            <span>{refreshing ? "Refreshing" : "Refresh"}</span>
          </button>
        </header>

        {error && (
          <div className="wallet-error-message" role="alert">
            <div>
              <strong>Unable to load wallet</strong>
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() => fetchWallet(true)}
              disabled={refreshing}
            >
              Retry
            </button>
          </div>
        )}

        <section className="wallet-balance-card">
          <div className="wallet-card-brand">
            <span className="wallet-card-logo">NF</span>
            <span>Digital wallet</span>
          </div>

          <div className="wallet-balance-copy">
            <p>Available balance</p>
            <h2>
              <span>৳</span>
              {formatAmount(wallet.balance)}
            </h2>
          </div>

          <div className="wallet-balance-footer">
            <span>Ready to use</span>
            <span className="wallet-status">
              <i aria-hidden="true" />
              Active
            </span>
          </div>
        </section>

        <nav className="wallet-actions" aria-label="Wallet actions">
          {walletActions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="wallet-action-item"
            >
              <span
                className={`wallet-action-icon ${action.tone}`}
                aria-hidden="true"
              >
                {action.icon}
              </span>
              <span>{action.label}</span>
            </Link>
          ))}
        </nav>

        <section className="wallet-summary-section">
          <div className="wallet-section-heading">
            <div>
              <p>Overview</p>
              <h2>Account summary</h2>
            </div>

            <Link to="/transactions">View history</Link>
          </div>

          <div className="wallet-summary-grid">
            {walletSummary.map((item) => (
              <article
                key={item.label}
                className={`wallet-summary-card ${item.tone}`}
              >
                <span
                  className="wallet-summary-icon"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>

                <div>
                  <p>{item.label}</p>
                  <h3>৳{formatAmount(item.value)}</h3>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="wallet-info-card">
          <span className="wallet-info-icon" aria-hidden="true">
            ✓
          </span>

          <div>
            <h3>Secure wallet</h3>
            <p>
              Never share your password, login token or verification
              code.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Wallet;
