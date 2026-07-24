import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import "../styles/Wallet.css";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const defaultWallet = {
  balance: 0,
  totalDeposit: 0,
  totalWithdraw: 0,
  totalEarning: 0,
  referralCommissionEarned: 0,
};

function Wallet() {
  const [wallet, setWallet] = useState(defaultWallet);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const formatAmount = (amount) => {
    const numericAmount = Number(amount) || 0;

    return new Intl.NumberFormat("en-BD", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  };

  const fetchWallet = useCallback(async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = localStorage.getItem("userToken");

      if (!token) {
        throw new Error("Please login to view your wallet");
      }

      const response = await axios.get(`${API_URL}/wallet`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      /*
        Supported response formats:

        {
          success: true,
          wallet: {}
        }

        {
          success: true,
          data: {}
        }

        {
          success: true,
          data: {
            wallet: {}
          }
        }
      */

      const walletData =
        response.data?.wallet ||
        response.data?.data?.wallet ||
        response.data?.data ||
        {};

      setWallet({
        balance: walletData.balance ?? 0,
        totalDeposit: walletData.totalDeposit ?? 0,
        totalWithdraw: walletData.totalWithdraw ?? 0,
        totalEarning: walletData.totalEarning ?? 0,
        referralCommissionEarned:
          walletData.referralCommissionEarned ?? 0,
      });
    } catch (error) {
      console.error(
        "Wallet fetch error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          error.message ||
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
            <p className="wallet-header-label">My account</p>
            <h1>Wallet</h1>
          </div>

          <button
            type="button"
            className="wallet-refresh-button"
            onClick={() => fetchWallet(true)}
            disabled={refreshing}
            aria-label="Refresh wallet"
          >
            <span className={refreshing ? "refresh-icon rotating" : "refresh-icon"}>
              ↻
            </span>

            <span>{refreshing ? "Refreshing" : "Refresh"}</span>
          </button>
        </header>

        {error && (
          <div className="wallet-error-message" role="alert">
            <span>⚠️</span>

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
          <div className="wallet-balance-top">
            <div>
              <p>Available Balance</p>

              <h2>
                <span>৳</span>
                {formatAmount(wallet.balance)}
              </h2>
            </div>

            <div className="wallet-balance-icon">💳</div>
          </div>

          <div className="wallet-balance-footer">
            <span>Secure wallet</span>
            <span className="wallet-status">
              <span className="wallet-status-dot" />
              Active
            </span>
          </div>
        </section>

        <section className="wallet-actions">
          <Link to="/deposit" className="wallet-action-item">
            <span className="wallet-action-icon deposit-icon">＋</span>
            <span>Deposit</span>
          </Link>

          <Link to="/withdraw" className="wallet-action-item">
            <span className="wallet-action-icon withdraw-icon">−</span>
            <span>Withdraw</span>
          </Link>

          <Link to="/transactions" className="wallet-action-item">
            <span className="wallet-action-icon history-icon">↕</span>
            <span>History</span>
          </Link>

          <Link to="/packages" className="wallet-action-item">
            <span className="wallet-action-icon package-icon">▣</span>
            <span>Packages</span>
          </Link>
        </section>

        <section className="wallet-summary-section">
          <div className="wallet-section-heading">
            <div>
              <p>Account overview</p>
              <h2>Wallet Summary</h2>
            </div>
          </div>

          <div className="wallet-summary-grid">
            <article className="wallet-summary-card">
              <div className="wallet-summary-icon">↓</div>

              <div>
                <p>Total Deposit</p>
                <h3>৳{formatAmount(wallet.totalDeposit)}</h3>
              </div>
            </article>

            <article className="wallet-summary-card">
              <div className="wallet-summary-icon">↑</div>

              <div>
                <p>Total Withdraw</p>
                <h3>৳{formatAmount(wallet.totalWithdraw)}</h3>
              </div>
            </article>

            <article className="wallet-summary-card">
              <div className="wallet-summary-icon">★</div>

              <div>
                <p>Total Earning</p>
                <h3>৳{formatAmount(wallet.totalEarning)}</h3>
              </div>
            </article>

            <article className="wallet-summary-card">
              <div className="wallet-summary-icon">♟</div>

              <div>
                <p>Referral Income</p>
                <h3>
                  ৳{formatAmount(wallet.referralCommissionEarned)}
                </h3>
              </div>
            </article>
          </div>
        </section>

        <section className="wallet-info-card">
          <div className="wallet-info-icon">🔐</div>

          <div>
            <h3>Your wallet is protected</h3>
            <p>
              Never share your password, login token or verification code
              with anyone.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Wallet;