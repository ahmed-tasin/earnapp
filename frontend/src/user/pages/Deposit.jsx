import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import "../styles/Deposit.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://earnapp-n5b2.onrender.com/api";

const initialForm = {
  amount: "",
  method: "bkash",
  senderNumber: "",
  transactionId: "",
};

function Deposit() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const paymentAccounts = {
    bkash: {
      name: "bKash",
      number: "01XXXXXXXXX",
      type: "Send Money",
    },
    nagad: {
      name: "Nagad",
      number: "01XXXXXXXXX",
      type: "Send Money",
    },
    rocket: {
      name: "Rocket",
      number: "01XXXXXXXXX",
      type: "Send Money",
    },
  };

  const selectedAccount = paymentAccounts[formData.method];

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
      return "Enter a valid deposit amount";
    }

    if (amount < 100) {
      return "Minimum deposit amount is ৳100";
    }

    if (!/^01\d{9}$/.test(formData.senderNumber.trim())) {
      return "Enter a valid 11-digit sender number";
    }

    if (formData.transactionId.trim().length < 5) {
      return "Enter a valid transaction ID";
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
        setMessage("Please login before making a deposit");
        setMessageType("error");
        return;
      }

      const depositData = {
        amount: Number(formData.amount),
        method: formData.method,
        senderNumber: formData.senderNumber.trim(),
        transactionId: formData.transactionId.trim(),
      };

      const response = await axios.post(
        `${API_URL}/wallet/deposit`,
        depositData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data?.message ||
          "Deposit request submitted successfully"
      );

      setMessageType("success");
      setFormData(initialForm);

      setTimeout(() => {
        navigate("/transactions");
      }, 1500);
    } catch (error) {
      console.error(
        "Deposit error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to submit deposit request"
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(selectedAccount.number);

      setMessage("Payment number copied");
      setMessageType("success");
    } catch {
      setMessage("Could not copy payment number");
      setMessageType("error");
    }
  };

  return (
    <main className="deposit-page">
      <div className="deposit-container">
        <header className="deposit-header">
          <div>
            <p className="deposit-header-label">Add funds</p>
            <h1>Deposit</h1>
          </div>

          <Link to="/wallet" className="deposit-back-link">
            ← Wallet
          </Link>
        </header>

        <section className="deposit-info-card">
          <div className="deposit-info-icon">💳</div>

          <div>
            <h2>Submit Deposit Request</h2>
            <p>
              Send money to the account below, then submit your
              transaction information.
            </p>
          </div>
        </section>

        {message && (
          <div
            className={`deposit-message ${messageType}`}
            role="alert"
          >
            {message}
          </div>
        )}

        <form className="deposit-form" onSubmit={handleSubmit}>
          <div className="deposit-form-group">
            <label htmlFor="method">Payment Method</label>

            <div className="deposit-method-grid">
              {Object.entries(paymentAccounts).map(
                ([key, account]) => (
                  <label
                    key={key}
                    className={
                      formData.method === key
                        ? "deposit-method active"
                        : "deposit-method"
                    }
                  >
                    <input
                      type="radio"
                      name="method"
                      value={key}
                      checked={formData.method === key}
                      onChange={handleChange}
                    />

                    <span className="deposit-method-name">
                      {account.name}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          <section className="deposit-account-card">
            <div>
              <p>Send money to</p>
              <h3>{selectedAccount.number}</h3>
              <span>
                {selectedAccount.name} · {selectedAccount.type}
              </span>
            </div>

            <button
              type="button"
              onClick={copyAccountNumber}
              className="deposit-copy-button"
            >
              Copy
            </button>
          </section>

          <div className="deposit-form-group">
            <label htmlFor="amount">Deposit Amount</label>

            <div className="deposit-input-wrapper">
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

          <div className="deposit-form-group">
            <label htmlFor="senderNumber">Sender Number</label>

            <input
              id="senderNumber"
              type="tel"
              name="senderNumber"
              placeholder="01XXXXXXXXX"
              value={formData.senderNumber}
              onChange={handleChange}
              maxLength={11}
              autoComplete="tel"
              required
            />
          </div>

          <div className="deposit-form-group">
            <label htmlFor="transactionId">
              Transaction ID
            </label>

            <input
              id="transactionId"
              type="text"
              name="transactionId"
              placeholder="Example: 9AB12CD34E"
              value={formData.transactionId}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          <div className="deposit-notice">
            <span>⚠️</span>

            <p>
              Make sure the amount, sender number and transaction ID
              are correct before submitting.
            </p>
          </div>

          <button
            type="submit"
            className="deposit-submit-button"
            disabled={loading}
          >
            {loading
              ? "Submitting request..."
              : "Submit Deposit"}
          </button>
        </form>

        <div className="deposit-history-link">
          <Link to="/transactions">
            View transaction history →
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Deposit;