import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import "../styles/Withdraw.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://earnapp-n5b2.onrender.com/api";

const initialForm = {
  amount: "",
  password: "",
};

function Withdraw() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [savedAccount, setSavedAccount] = useState(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const withdrawMethods = {
    bkash: "bKash",
    nagad: "Nagad",
  };

  useEffect(() => {
    const loadSavedAccount = async () => {
      try {
        const token = localStorage.getItem("userToken");

        if (!token) {
          setAccountLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user =
          response.data?.user ||
          response.data?.data?.user ||
          response.data?.data ||
          response.data ||
          {};

        const savedAccount = user.withdrawalAccount;

        if (
          !savedAccount?.paymentMethod ||
          !savedAccount?.accountNumber
        ) {
          setSavedAccount(null);
          return;
        }

        setSavedAccount(savedAccount);
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "Failed to load saved withdrawal card"
        );
        setMessageType("error");
      } finally {
        setAccountLoading(false);
      }
    };

    loadSavedAccount();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setMessageType("");
  };

  const validateForm = () => {
    const amount = Number(formData.amount);

    if (!amount || amount <= 0) {
      return "Enter a valid withdraw amount";
    }

    if (amount < 100) {
      return "Minimum withdraw amount is ৳100";
    }

    if (!savedAccount) {
      return "Set your withdrawal card before withdrawing";
    }

    if (!formData.password) {
      return "Enter your login password";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("userToken");

      if (!token) {
        setMessage("Please login before requesting a withdrawal");
        setMessageType("error");
        return;
      }

      const withdrawData = {
        amount: Number(formData.amount),
        password: formData.password,
      };

      const response = await axios.post(
        `${API_URL}/wallet/withdraw`,
        withdrawData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data?.message ||
          "Withdraw request submitted successfully"
      );

      setMessageType("success");
      setFormData(initialForm);

      setTimeout(() => {
        navigate("/transactions");
      }, 1500);
    } catch (error) {
      console.error(
        "Withdraw error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to submit withdraw request"
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="withdraw-page">
      <div className="withdraw-container">
        <header className="withdraw-header">
          <div>
            <p className="withdraw-header-label">Cash out funds</p>
            <h1>Withdraw</h1>
          </div>

          <Link to="/wallet" className="withdraw-back-link">
            ← Wallet
          </Link>
        </header>

        <section className="withdraw-info-card">
          <div className="withdraw-info-icon">💸</div>

          <div>
            <h2>Submit Withdraw Request</h2>

            <p>
              Enter the amount and your login password. Payment will
              be sent to your saved withdrawal card.
            </p>
          </div>
        </section>

        {message && (
          <div
            className={`withdraw-message ${messageType}`}
            role="alert"
          >
            {message}
          </div>
        )}

        <form className="withdraw-form" onSubmit={handleSubmit}>
          {accountLoading ? (
            <section className="withdraw-saved-card loading">
              Loading saved card...
            </section>
          ) : savedAccount ? (
            <section className="withdraw-saved-card">
              <div>
                <span>Withdraw account</span>
                <strong>
                  {withdrawMethods[savedAccount.paymentMethod] ||
                    savedAccount.paymentMethod}
                </strong>
              </div>

              <div>
                <span>Account number</span>
                <strong>
                  {savedAccount.accountNumber.slice(0, 3)}
                  {"****"}
                  {savedAccount.accountNumber.slice(-4)}
                </strong>
              </div>
            </section>
          ) : (
            <section className="withdraw-saved-card missing">
              <p>No withdrawal card is saved.</p>
              <Link to="/card">Set Withdraw Card →</Link>
            </section>
          )}

          <div className="withdraw-form-group">
            <label htmlFor="amount">Withdraw Amount</label>

            <div className="withdraw-input-wrapper">
              <span>৳</span>

              <input
                id="amount"
                type="number"
                name="amount"
                placeholder="Minimum 100"
                value={formData.amount}
                onChange={handleChange}
                min="100"
                step="1"
                required
              />
            </div>
          </div>

          <div className="withdraw-form-group">
            <label htmlFor="password">Login Password</label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your login password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <section className="withdraw-summary-card">
            <div>
              <span>Withdraw Amount</span>
              <strong>
                ৳{Number(formData.amount || 0).toLocaleString("en-BD")}
              </strong>
            </div>

            <div>
              <span>Payment Method</span>
              <strong>
                {savedAccount
                  ? withdrawMethods[savedAccount.paymentMethod]
                  : "Not set"}
              </strong>
            </div>
          </section>

          <div className="withdraw-notice">
            <span>⚠️</span>

            <p>
              Your saved Card account will be used. Withdraw requests
              may require admin approval before payment.
            </p>
          </div>

          <button
            type="submit"
            className="withdraw-submit-button"
            disabled={loading || accountLoading || !savedAccount}
          >
            {loading
              ? "Submitting request..."
              : "Submit Withdraw"}
          </button>
        </form>

        <div className="withdraw-history-link">
          <Link to="/transactions">
            View transaction history →
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Withdraw;
