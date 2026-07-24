import React, { useState } from "react";
import axios from "axios";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import "../styles/Register.css";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setMessage(
        "Password এবং Confirm Password মিলছে না"
      );

      setMessageType("error");
      return;
    }

    if (formData.password.length < 6) {
      setMessage(
        "Password কমপক্ষে ৬ অক্ষরের হতে হবে"
      );

      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const registerData = {
        username:
          formData.username.trim(),

        email:
          formData.email
            .trim()
            .toLowerCase(),

        phone:
          formData.phone.trim(),

        password: formData.password,
      };

      if (
        formData.referralCode.trim()
      ) {
        registerData.referralCode =
          formData.referralCode.trim();
      }

      const response =
        await axios.post(
          `${API_URL}/auth/register`,
          registerData
        );

      setMessage(
        response.data?.message ||
          "Registration successful"
      );

      setMessageType("success");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1000);
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data ||
          error.message
      );

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Registration failed"
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-register-page">
      <div className="user-register-card">
        <div className="register-logo">
          EA
        </div>

        <h1>Create Account</h1>

        <p className="register-subtitle">
          Join the investment platform
        </p>

        {message && (
          <div
            className={`register-message ${messageType}`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="register-form-group">
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="phone">
              Phone Number
            </label>

            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="01XXXXXXXXX"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Enter password again"
              value={
                formData.confirmPassword
              }
              onChange={handleChange}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="referralCode">
              Referral Code
              <span> Optional</span>
            </label>

            <input
              id="referralCode"
              type="text"
              name="referralCode"
              placeholder="Enter referral code"
              value={
                formData.referralCode
              }
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="register-submit-button"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>

        <p className="register-login-link">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;