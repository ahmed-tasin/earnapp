import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import "../styles/Withdraw.css";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const initialForm = {
  amount: "",
  method: "bkash",
  accountNumber: "",
};

function Withdraw() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const withdrawMethods = {
    bkash: "bKash",
    nagad: "Nagad",
    rocket: "Rocket",
  };

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

    if (!/^01\d{9}$/.test(formData.accountNumber.trim())) {
      return "Enter a valid 11-digit account number";
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
        method: formData.method,
        accountNumber: formData.accountNumber.trim(),
      };

      const response = await axios.post(
        `${API_URL}/withdraw`,
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
              Select your payment method and enter the account where
              you want to receive the money.
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
          <div className="withdraw-form-group">
            <label>Payment Method</label>

            <div className="withdraw-method-grid">
              {Object.entries(withdrawMethods).map(
                ([key, methodName]) => (
                  <label
                    key={key}
                    className={
                      formData.method === key
                        ? "withdraw-method active"
                        : "withdraw-method"
                    }
                  >
                    <input
                      type="radio"
                      name="method"
                      value={key}
                      checked={formData.method === key}
                      onChange={handleChange}
                    />

                    <span>{methodName}</span>
                  </label>
                )
              )}
            </div>
          </div>

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
            <label htmlFor="accountNumber">
              {withdrawMethods[formData.method]} Account Number
            </label>

            <input
              id="accountNumber"
              type="tel"
              name="accountNumber"
              placeholder="01XXXXXXXXX"
              value={formData.accountNumber}
              onChange={handleChange}
              maxLength={11}
              autoComplete="tel"
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
              <strong>{withdrawMethods[formData.method]}</strong>
            </div>
          </section>

          <div className="withdraw-notice">
            <span>⚠️</span>

            <p>
              Check your account number carefully. Withdraw requests
              may require admin approval before payment.
            </p>
          </div>

          <button
            type="submit"
            className="withdraw-submit-button"
            disabled={loading}
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