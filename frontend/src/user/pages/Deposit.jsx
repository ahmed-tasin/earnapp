import React, { useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

import "../styles/Deposit.css";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://earnapp-n5b2.onrender.com/api";

const PRESET_AMOUNTS = [
  500,
  1000,
  1500,
  2000,
  3000,
  4000,
  5000,
  10000,
  20000,
  50000,
];

function Deposit() {
  const location = useLocation();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const paymentStatus = new URLSearchParams(
    location.search
  ).get("payment");

  const selectAmount = (value) => {
    setAmount(String(value));
    setMessage("");
  };

  const handleCheckout = async () => {
    const depositAmount = Number(amount);

    if (
      !Number.isInteger(depositAmount) ||
      depositAmount < 500
    ) {
      setMessage("Minimum deposit amount is ৳500");
      return;
    }

    const token =
      localStorage.getItem("userToken") ||
      localStorage.getItem("token");

    if (!token) {
      setMessage("Please login before making a deposit");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(
        `${API_URL}/payment/uddoktapay/checkout`,
        {
          amount: depositAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const paymentUrl = response.data?.paymentUrl;

      if (!paymentUrl) {
        throw new Error("Payment URL not received");
      }

      window.location.assign(paymentUrl);

    } catch (error) {
      console.error(
        "Checkout error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
        "Unable to start payment. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="deposit-page">
      <div className="deposit-container">

        <header className="deposit-header">
          <div>
            <h1>Deposit</h1>
          </div>

          <Link to="/wallet">
            ← Wallet
          </Link>
        </header>

        {paymentStatus === "success" && (
          <div className="deposit-message success">
            Payment verified successfully. Your wallet has
            been credited.
          </div>
        )}

        {paymentStatus === "pending" && (
          <div className="deposit-message">
            Payment verification is pending. Please check
            your transaction history.
          </div>
        )}

        {paymentStatus === "failed" && (
          <div className="deposit-message error">
            Payment could not be verified.
          </div>
        )}

        {paymentStatus === "cancelled" && (
          <div className="deposit-message">
            Payment was cancelled.
          </div>
        )}

        {message && (
          <div className="deposit-message error">
            {message}
          </div>
        )}

        <section className="deposit-panel">

          <div className="deposit-section-heading">
            <span>1</span>

            <div>
              <h2>Select deposit amount</h2>
              <p>
                Minimum deposit amount ৳500
              </p>
            </div>
          </div>

          <div className="deposit-amount-grid">
            {PRESET_AMOUNTS.map((value) => (
              <button
                type="button"
                key={value}
                className={
                  Number(amount) === value ? "active" : ""
                }
                onClick={() => selectAmount(value)}
              >
                ৳{value.toLocaleString("en-BD")}
              </button>
            ))}
          </div>

          <label
            className="deposit-custom-amount"
            htmlFor="depositAmount"
          >
            <span>Custom amount</span>

            <div>
              <strong>৳</strong>

              <input
                id="depositAmount"
                type="number"
                min="500"
                step="1"
                inputMode="numeric"
                placeholder="Enter amount"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setMessage("");
                }}
              />
            </div>
          </label>

          <div className="deposit-instruction">
            <strong>Secure Online Payment</strong>
            <p>
              You will be redirected to UddoktaPay's secure
              checkout page to complete your payment.
            </p>
          </div>

          <button
            type="button"
            className="deposit-primary-button"
            onClick={handleCheckout}
            disabled={loading || !amount}
          >
            {loading
              ? "Redirecting..."
              : `Pay ৳${Number(amount || 0).toLocaleString("en-BD")} Now`}
          </button>

        </section>

        <section
          className="deposit-rules"
          aria-labelledby="deposit-rules-title"
        >
          <div className="deposit-rules-heading">
            <span aria-hidden="true">i</span>

            <div>
              <p>Important information</p>
              <h2 id="deposit-rules-title">
                রিচার্জ-সংক্রান্ত নিয়মাবলি
              </h2>
            </div>
          </div>

          <ol>
            <li>
              সর্বনিম্ন ডিপোজিটের পরিমাণ <strong>৳৫০০</strong>।
            </li>

            <li>
              পেমেন্ট করার সময় সঠিক পরিমাণ নির্বাচন করুন।
            </li>

            <li>
              পেমেন্ট সম্পন্ন না হওয়া পর্যন্ত পেজ বন্ধ করবেন না।
            </li>

            <li>
              পেমেন্ট সফল হওয়ার পর সার্ভার থেকে যাচাই করে
              ব্যালেন্স যোগ করা হবে।
            </li>

            <li>
              ব্যালেন্স যোগ না হলে Transaction History
              পরীক্ষা করুন এবং প্রয়োজনে Support-এ যোগাযোগ করুন।
            </li>
          </ol>
        </section>

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