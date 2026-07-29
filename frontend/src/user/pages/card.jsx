import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import "../styles/card.css";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://earnapp-n5b2.onrender.com/api";

const initialForm = {
  accountName: "",
  paymentMethod: "bkash",
  accountNumber: "",
};

const paymentMethods = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
};

function Card() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState(initialForm);

  const [savedAccount, setSavedAccount] =
    useState(null);

  const [isEditing, setIsEditing] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");

  const getToken = () =>
    localStorage.getItem("userToken");

  // ================= LOAD SAVED CARD =================

  const loadAccount = useCallback(async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      const response = await axios.get(
        `${API_URL}/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const user =
        response.data?.user ||
        response.data?.data?.user ||
        response.data?.data ||
        response.data ||
        {};

      const card =
        user.withdrawalAccount || {};

      const normalizedCard = {
        accountName:
          card.accountName ||
          user.name ||
          user.username ||
          "",

        paymentMethod:
          card.paymentMethod ||
          "bkash",

        accountNumber:
          card.accountNumber ||
          "",
      };

      const hasSavedCard = Boolean(
        card.accountName &&
          card.paymentMethod &&
          card.accountNumber
      );

      setFormData(normalizedCard);

      if (hasSavedCard) {
        setSavedAccount(
          normalizedCard
        );

        // Card থাকলে form hide
        setIsEditing(false);
      } else {
        setSavedAccount(null);

        // প্রথমবার form দেখা যাবে
        setIsEditing(true);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to load withdrawal card"
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  // ================= INPUT CHANGE =================

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setMessageType("");
  };

  // ================= VALIDATION =================

  const validateForm = () => {
    const accountName =
      formData.accountName.trim();

    const accountNumber =
      formData.accountNumber
        .trim()
        .replace(/[\s-]/g, "");

    if (
      accountName.length < 2 ||
      accountName.length > 50
    ) {
      return "Name must be 2-50 characters";
    }

    if (
      !Object.keys(
        paymentMethods
      ).includes(
        formData.paymentMethod
      )
    ) {
      return "Select a payment method";
    }

    if (
      !/^(?:\+?880|0)?1\d{9}$/.test(
        accountNumber
      )
    ) {
      return `Enter a valid ${
        paymentMethods[
          formData.paymentMethod
        ]
      } number`;
    }

    return "";
  };

  // ================= SAVE OR UPDATE =================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    const validationError =
      validateForm();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      const payload = {
        accountName:
          formData.accountName.trim(),

        paymentMethod:
          formData.paymentMethod,

        accountNumber:
          formData.accountNumber
            .trim()
            .replace(/[\s-]/g, ""),
      };

      const response = await axios.put(
        `${API_URL}/user/withdrawal-account`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseCard =
        response.data?.withdrawalAccount ||
        response.data?.data
          ?.withdrawalAccount ||
        payload;

      // Phone field intentionally নেওয়া হচ্ছে না
      const updatedCard = {
        accountName:
          responseCard.accountName ||
          payload.accountName,

        paymentMethod:
          responseCard.paymentMethod ||
          payload.paymentMethod,

        accountNumber:
          responseCard.accountNumber ||
          payload.accountNumber,
      };

      setFormData(updatedCard);
      setSavedAccount(updatedCard);

      // Save সফল হলে form hide
      setIsEditing(false);

      const storedUser = JSON.parse(
        localStorage.getItem("user") ||
          "{}"
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          withdrawalAccount:
            updatedCard,
        })
      );

      setMessage(
        response.data?.message ||
          "Withdrawal card saved successfully"
      );

      setMessageType("success");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to save withdrawal card"
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  // ================= OPEN EDIT FORM =================

  const handleEdit = () => {
    if (savedAccount) {
      setFormData(savedAccount);
    }

    setMessage("");
    setMessageType("");

    // Edit করলে form দেখা যাবে
    setIsEditing(true);
  };

  // ================= CANCEL EDIT =================

  const handleCancel = () => {
    if (savedAccount) {
      // Unsaved change বাদ দিয়ে
      // আগের saved data ফেরত
      setFormData(savedAccount);
    }

    setMessage("");
    setMessageType("");

    // Cancel করলে form hide
    setIsEditing(false);
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <main className="card-page">
        <div className="card-loading">
          <div className="card-spinner" />

          <p>Loading card...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="card-page">
      <div className="card-container">
        {/* ================= HEADER ================= */}

        <header className="card-header">
          <button
            type="button"
            className="card-back-button"
            onClick={() =>
              navigate(-1)
            }
            aria-label="Go back"
          >
            ←
          </button>

          <div>
            <p>Payment details</p>

            <h1>Withdraw Card</h1>
          </div>

          <span
            className="card-header-icon"
            aria-hidden="true"
          >
            ▣
          </span>
        </header>

        {/* ================= CARD PREVIEW ================= */}

        <section className="withdrawal-card-preview">
          <div className="withdrawal-card-top">
            <div>
              <span>
                Withdraw account
              </span>

              <strong>
                {paymentMethods[
                  formData.paymentMethod
                ] || "Not selected"}
              </strong>
            </div>

            <span
              className="withdrawal-card-chip"
              aria-hidden="true"
            />
          </div>

          <p className="withdrawal-card-number">
            {formData.accountNumber ||
              "01XXXXXXXXX"}
          </p>

          <div className="withdrawal-card-bottom">
            <div>
              <span>
                Account holder
              </span>

              <strong>
                {formData.accountName ||
                  "Your name"}
              </strong>
            </div>
          </div>
        </section>

        {/* ================= MESSAGE ================= */}

        {message && (
          <div
            className={`card-message ${messageType}`}
            role="alert"
          >
            {message}
          </div>
        )}

        {/* Saved Card থাকলে শুধু Edit button */}

        {!isEditing &&
          savedAccount && (
            <button
              type="button"
              className="card-edit-button"
              onClick={handleEdit}
            >
              Edit Withdraw Card
            </button>
          )}

        {/* ================= FORM ================= */}

        {isEditing && (
          <form
            className="card-form"
            onSubmit={handleSubmit}
          >
            <div className="card-form-heading">
              <p>
                এই তথ্য Withdraw করার
                সময় ব্যবহার হবে
              </p>

              <h2>
                {savedAccount
                  ? "Edit Withdraw Information"
                  : "Withdraw Information"}
              </h2>
            </div>

            {/* Account Name */}

            <div className="card-form-group">
              <label htmlFor="accountName">
                নাম
              </label>

              <input
                id="accountName"
                type="text"
                name="accountName"
                value={
                  formData.accountName
                }
                onChange={handleChange}
                placeholder="অ্যাকাউন্টের নাম লিখুন"
                minLength={2}
                maxLength={50}
                autoComplete="name"
                required
              />
            </div>

            {/* Payment Method */}

            <div className="card-form-group">
              <label htmlFor="paymentMethod">
                পেমেন্ট মাধ্যম
              </label>

              <select
                id="paymentMethod"
                name="paymentMethod"
                value={
                  formData.paymentMethod
                }
                onChange={handleChange}
                required
              >
                <option value="bkash">
                  বিকাশ
                </option>

                <option value="nagad">
                  নগদ
                </option>

                <option value="rocket">
                  রকেট
                </option>
              </select>
            </div>

            {/* Payment Account Number */}

           <div className="card-form-group">
  <label htmlFor="accountNumber">
    {paymentMethods[formData.paymentMethod]} Number
  </label>

  <input
    id="accountNumber"
    type="tel"
    name="accountNumber"
    value={formData.accountNumber}
    onChange={handleChange}
    placeholder={`Enter ${
      paymentMethods[formData.paymentMethod]
    } number`}
    maxLength={14}
    inputMode="numeric"
    required
  />
</div>

            {/* Buttons */}

            <div className="card-form-actions">
              {savedAccount && (
                <button
                  type="button"
                  className="card-cancel-button"
                  onClick={
                    handleCancel
                  }
                  disabled={saving}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="card-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : savedAccount
                    ? "Update Withdraw Card"
                    : "Save Withdraw Card"}
              </button>
            </div>
          </form>
        )}

        <Link
          to="/withdraw"
          className="card-withdraw-link"
        >
          Go to Withdraw →
        </Link>
      </div>
    </main>
  );
}

export default Card;