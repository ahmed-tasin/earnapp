import React, { useState } from "react";
import axios from "axios";
import "../styles/UserLogin.css";
import {
  Link,
  useNavigate,
} from "react-router-dom";


const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://earnapp-n5b2.onrender.com/api";

function UserLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      phone: "",
      password: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
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

    try {
      setLoading(true);
      setMessage("");

      const response =
        await axios.post(
          `${API_URL}/auth/login`,
          formData
        );

      const data = response.data;

      const token =
        data.token ||
        data.accessToken ||
        data.data?.token ||
        data.data?.accessToken;

      const user =
        data.user ||
        data.data?.user ||
        null;

      if (!token) {
        throw new Error(
          "Login token পাওয়া যায়নি"
        );
      }

      if (user?.role === "admin") {
        setMessage(
          "Admin account দিয়ে user login করা যাবে না"
        );

        return;
      }

      localStorage.setItem(
        "userToken",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user || {})
      );

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-login-page">
      <div className="user-login-card">
        <h1>User Login</h1>

        {message && (
          <div className="user-login-message">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>Phone Number</label>

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="01XXXXXXXXX"
            autoComplete="tel"
            maxLength={15}
            required
          />

          <label>Password</label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <p>
          নতুন account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default UserLogin;