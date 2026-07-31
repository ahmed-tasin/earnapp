import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import "../styles/Transactions.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://earnapp-n5b2.onrender.com/api";

const transactionTypes = [
  { value: "all", label: "All" },
  { value: "deposit", label: "Deposit" },
  { value: "withdraw", label: "Withdraw" },
  { value: "investment", label: "Investment" },
  { value: "earning", label: "Earning" },
  { value: "referral", label: "Referral" },
];

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchTransactions = useCallback(async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = localStorage.getItem("userToken");

      if (!token) {
        throw new Error("Please login to view transaction history");
      }

      const response = await axios.get(`${API_URL}/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      /*
        Supported response formats:

        {
          success: true,
          transactions: []
        }

        {
          success: true,
          data: {
            transactions: []
          }
        }

        {
          success: true,
          data: []
        }
      */

      const transactionData =
        response.data?.transactions ||
        response.data?.data?.transactions ||
        response.data?.data ||
        [];

      setTransactions(
        Array.isArray(transactionData) ? transactionData : []
      );
    } catch (error) {
      console.error(
        "Transaction fetch error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load transaction history"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    if (activeFilter === "all") {
      return transactions;
    }

    return transactions.filter((transaction) => {
      const type = String(
        transaction.type ||
          transaction.transactionType ||
          transaction.category ||
          ""
      ).toLowerCase();

      return type === activeFilter;
    });
  }, [transactions, activeFilter]);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Unknown date";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return new Intl.DateTimeFormat("en-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getTransactionType = (transaction) => {
    return String(
      transaction.type ||
        transaction.transactionType ||
        transaction.category ||
        "transaction"
    ).toLowerCase();
  };

  const getTransactionStatus = (transaction) => {
    return String(transaction.status || "pending").toLowerCase();
  };

  const getTransactionTitle = (transaction) => {
    const type = getTransactionType(transaction);

    const titles = {
      deposit: "Deposit",
      withdraw: "Withdraw",
      withdrawal: "Withdraw",
      investment: "Package Investment",
      earning: "Daily Earning",
      profit: "Daily Profit",
      referral: "Referral Commission",
      checkin: "Daily Check-in Reward",
      bonus: "Bonus",
    };

    return (
      transaction.title ||
      transaction.description ||
      titles[type] ||
      "Transaction"
    );
  };

  const getTransactionIcon = (transaction) => {
    const type = getTransactionType(transaction);

    const icons = {
      deposit: "↓",
      withdraw: "↑",
      withdrawal: "↑",
      investment: "▣",
      earning: "★",
      profit: "★",
      referral: "♟",
      checkin: "✓",
      bonus: "🎁",
    };

    return icons[type] || "↕";
  };

  const isCreditTransaction = (transaction) => {
    const type = getTransactionType(transaction);

    if (
      typeof transaction.isCredit === "boolean"
    ) {
      return transaction.isCredit;
    }

    return [
      "deposit",
      "earning",
      "profit",
      "referral",
      "checkin",
      "bonus",
    ].includes(type);
  };

  if (loading) {
    return (
      <main className="transactions-page">
        <div className="transactions-container">
          <div className="transactions-loading">
            <div className="transactions-spinner" />
            <p>Loading transactions...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="transactions-page">
      <div className="transactions-container">
        <header className="transactions-header">
          <div>
            {/* <p className="transactions-header-label">
              Account activity
            </p> */}

            <h1>Transactions</h1>
          </div>

          {/* <button
            type="button"
            className="transactions-refresh-button"
            onClick={() => fetchTransactions(true)}
            disabled={refreshing}
          >
            <span
              className={
                refreshing
                  ? "transactions-refresh-icon rotating"
                  : "transactions-refresh-icon"
              }
            >
              ↻
            </span>

            <span>
              {refreshing ? "Refreshing" : "Refresh"}
            </span>
          </button> */}
        </header>

        {/* <section className="transactions-summary-card">
          <div>
            <span>Total Records</span>
            <strong>{transactions.length}</strong>
          </div>

          <div>
            <span>Showing</span>
            <strong>{filteredTransactions.length}</strong>
          </div>

          <Link to="/wallet">
            Back to Wallet
          </Link>
        </section> */}

        {error && (
          <div className="transactions-error" role="alert">
            <div>
              <strong>Could not load transactions</strong>
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() => fetchTransactions(true)}
              disabled={refreshing}
            >
              Retry
            </button>
          </div>
        )}

        <section className="transactions-filter-section">
          <div className="transactions-filter-list">
            {transactionTypes.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={
                  activeFilter === filter.value
                    ? "transaction-filter-button active"
                    : "transaction-filter-button"
                }
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        <section className="transactions-list">
          {filteredTransactions.length === 0 ? (
            <div className="transactions-empty-state">
              <div className="transactions-empty-icon">
                ↕
              </div>

              <h2>No transactions found</h2>

              <p>
                Your deposit, withdrawal, earning and investment
                history will appear here.
              </p>

              <div className="transactions-empty-actions">
                <Link to="/deposit">
                  Make Deposit
                </Link>

                <Link to="/wallet">
                  Open Wallet
                </Link>
              </div>
            </div>
          ) : (
            filteredTransactions.map((transaction, index) => {
              const type = getTransactionType(transaction);
              const status = getTransactionStatus(transaction);
              const isCredit = isCreditTransaction(transaction);

              const transactionId =
                transaction._id ||
                transaction.id ||
                `${type}-${index}`;

              return (
                <article
                  key={transactionId}
                  className="transaction-card"
                >
                  <div
                    className={`transaction-icon transaction-icon-${type}`}
                  >
                    {getTransactionIcon(transaction)}
                  </div>

                  <div className="transaction-details">
                    <div className="transaction-title-row">
                      <h3>
                        {getTransactionTitle(transaction)}
                      </h3>

                      <span
                        className={`transaction-status status-${status}`}
                      >
                        {status}
                      </span>
                    </div>

                    <p className="transaction-date">
                      {formatDate(
                        transaction.createdAt ||
                          transaction.date ||
                          transaction.updatedAt
                      )}
                    </p>

                    {(transaction.transactionId ||
                      transaction.reference ||
                      transaction.referenceId) && (
                      <p className="transaction-reference">
                        Ref:{" "}
                        {transaction.transactionId ||
                          transaction.reference ||
                          transaction.referenceId}
                      </p>
                    )}

                    {(transaction.method ||
                      transaction.paymentMethod) && (
                      <p className="transaction-method">
                        Method:{" "}
                        {transaction.method ||
                          transaction.paymentMethod}
                      </p>
                    )}
                  </div>

                  <div
                    className={
                      isCredit
                        ? "transaction-amount credit"
                        : "transaction-amount debit"
                    }
                  >
                    <strong>
                      {isCredit ? "+" : "-"}৳
                      {formatAmount(transaction.amount)}
                    </strong>

                    <span>
                      {isCredit ? "Received" : "Deducted"}
                    </span>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}

export default Transactions;