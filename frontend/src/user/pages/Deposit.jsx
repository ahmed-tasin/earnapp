import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

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

const PAYMENT_ACCOUNTS = {
  bkash: {
    name: "bKash",
    number: "01624666556",
    type: "Send Money",
  },
  nagad: {
    name: "Nagad",
    number: "01907522074",
    type: "Send Money",
  },
};

const initialForm = {
  amount: "",
  method: "bkash",
  senderNumber: "",
  transactionId: "",
};

function Deposit() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const selectedAccount = PAYMENT_ACCOUNTS[formData.method];
  const selectedAmount = Number(formData.amount);
  const timerExpired = secondsLeft <= 0;

  useEffect(() => {
    if (step !== 2 || timerExpired) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setSecondsLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [step, timerExpired]);

  useEffect(() => {
    if (step === 2 && timerExpired) {
      setMessage(
        "Payment time expired. Please go back and start again."
      );
      setMessageType("error");
    }
  }, [step, timerExpired]);

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    clearMessage();
  };

  const selectMethod = (method) => {
    setFormData((previous) => ({
      ...previous,
      method,
    }));
    clearMessage();
  };

  const selectAmount = (amount) => {
    setFormData((previous) => ({
      ...previous,
      amount: String(amount),
    }));
    clearMessage();
  };

  const continueToPayment = () => {
    if (!selectedAmount || selectedAmount < 500) {
      setMessage("Minimum deposit amount is ৳500");
      setMessageType("error");
      return;
    }

    setSecondsLeft(600);
    clearMessage();
    setStep(2);
  };

  const backToSelection = () => {
    setStep(1);
    setSecondsLeft(600);
    clearMessage();
  };

  const validatePayment = () => {
    if (timerExpired) {
      return "Payment time expired. Please start again.";
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

    clearMessage();

    const validationError = validatePayment();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem("userToken") ||
        localStorage.getItem("token");

      if (!token) {
        setMessage("Please login before making a deposit");
        setMessageType("error");
        return;
      }

      const response = await axios.post(
        `${API_URL}/wallet/deposit`,
        {
          amount: selectedAmount,
          paymentMethod: formData.method,
          senderNumber: formData.senderNumber.trim(),
          trxId: formData.transactionId.trim(),
        },
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

      window.setTimeout(() => {
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

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTimer = `${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;

  return (
    <main className="deposit-page">
      <div className="deposit-container">
        <header className="deposit-header">
          <div>
            {/* <p>{step === 1 ? "Add funds" : "Complete payment"}</p> */}
            <h1>Deposit</h1>
          </div>

          {step === 1 ? (
            <Link to="/wallet">← Wallet</Link>
          ) : (
            <button type="button" onClick={backToSelection}>
              ← Back
            </button>
          )}
        </header>

        <div className="deposit-steps" aria-label="Deposit progress">
          <span className="active">1</span>
          <i className={step === 2 ? "active" : ""} />
          <span className={step === 2 ? "active" : ""}>2</span>
        </div>

        {message && (
          <div
            className={`deposit-message ${messageType}`}
            role="alert"
          >
            {message}
          </div>
        )}

        {step === 1 ? (
          <section className="deposit-panel">
            <div className="deposit-section-heading">
              <span>1</span>
              <div>
                <h2>Select payment method</h2>
                <p>Choose bKash or Nagad</p>
              </div>
            </div>

            <div className="deposit-method-grid">
              {Object.entries(PAYMENT_ACCOUNTS).map(
                ([key, account]) => (
                  <button
                    type="button"
                    key={key}
                    className={
                      formData.method === key
                        ? `deposit-method ${key} active`
                        : `deposit-method ${key}`
                    }
                    onClick={() => selectMethod(key)}
                  >
                    <span>{account.name.charAt(0)}</span>
                    <strong>{account.name}</strong>
                    <small>Send Money</small>
                  </button>
                )
              )}
            </div>

            <div className="deposit-section-heading amount-heading">
              <span>2</span>
              <div>
                <h2>Select amount</h2>
                <p>Choose an amount or enter your own</p>
              </div>
            </div>

            <div className="deposit-amount-grid">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  type="button"
                  key={amount}
                  className={
                    selectedAmount === amount ? "active" : ""
                  }
                  onClick={() => selectAmount(amount)}
                >
                  ৳{amount.toLocaleString("en-BD")}
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
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="500"
                  step="1"
                  placeholder="Enter amount"
                  inputMode="numeric"
                />
              </div>
            </label>

            <button
              type="button"
              className="deposit-primary-button"
              onClick={continueToPayment}
              disabled={!selectedAmount}
            >
              Continue with {selectedAccount.name}
            </button>
          </section>
        ) : (
          <form className="deposit-panel" onSubmit={handleSubmit}>
            <div
              className={
                timerExpired
                  ? "deposit-payment-timer expired"
                  : "deposit-payment-timer"
              }
            >
              <span>Complete payment within</span>
              <strong>{formattedTimer}</strong>
            </div>

            <section className="deposit-payment-summary">
              <div className={`deposit-brand ${formData.method}`}>
                {selectedAccount.name.charAt(0)}
              </div>

              <p>Send Money to this {selectedAccount.name} number</p>

              <div className="deposit-number-row">
                <strong>{selectedAccount.number}</strong>
                <button type="button" onClick={copyAccountNumber}>
                  Copy
                </button>
              </div>

              <span className="deposit-send-label">SEND EXACTLY</span>
              <h2>৳{selectedAmount.toLocaleString("en-BD")}</h2>
            </section>

            <div className="deposit-instruction">
              Open {selectedAccount.name}, select{" "}
              <strong>Send Money</strong>, send the exact amount and
              submit the sender number and transaction ID below.
            </div>

            <div className="deposit-form-group">
              <label htmlFor="senderNumber">Sender number</label>
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
              <label htmlFor="transactionId">Transaction ID</label>
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

            <button
              type="submit"
              className="deposit-primary-button"
              disabled={loading || timerExpired}
            >
              {loading ? "Submitting..." : "Submit Deposit"}
            </button>
          </form>
        )}

<section className="deposit-rules" aria-labelledby="deposit-rules-title">
  <div className="deposit-rules-heading">
    <span aria-hidden="true">i</span>

    <div>
      <p>Important information</p>
      <h2 id="deposit-rules-title">রিচার্জ-সংক্রান্ত নিয়মাবলি</h2>
    </div>
  </div>

  <ol>
    <li>
      সর্বনিম্ন রিচার্জের পরিমাণ <strong>৳৫০০</strong>।
    </li>

    <li>
      সর্বনিম্ন নির্ধারিত পরিমাণের চেয়ে কম টাকা ডিপোজিট করলে তা
      আপনার অ্যাকাউন্টের ব্যালেন্সে যোগ হবে না।
    </li>

    <li>
      রিচার্জের টাকা শুধুমাত্র{" "}
      <strong>Send Money (সেন্ড মানি)</strong> অপশনের মাধ্যমে পাঠাতে হবে।
    </li>

    <li>
      পাঠানো টাকার পরিমাণ অবশ্যই আপনার ডিপোজিট অর্ডারে উল্লেখ করা
      টাকার পরিমাণের সঙ্গে মিলতে হবে। অন্যথায় টাকা সফলভাবে জমা হবে না।
    </li>

    <li>
      প্রতিবার পেমেন্ট করার আগে একটি নতুন ডিপোজিট অর্ডার তৈরি করুন এবং
      অর্ডারে প্রদর্শিত নির্দিষ্ট রিচার্জ অ্যাকাউন্টে টাকা পাঠান।
    </li>

    <li>
      টাকা পাঠানোর পর অনুগ্রহ করে <strong>১০–২০ মিনিট</strong> অপেক্ষা
      করুন। নির্ধারিত সময়ের মধ্যে ব্যালেন্স যোগ না হলে আমাদের কাস্টমার
      সার্ভিস টিমের সঙ্গে যোগাযোগ করুন।
    </li>
  </ol>
</section>


        <div className="deposit-history-link">
          <Link to="/transactions">View transaction history →</Link>
        </div>
      </div>
    </main>
  );
}

export default Deposit;
