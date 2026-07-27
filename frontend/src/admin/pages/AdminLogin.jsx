import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://earnapp-n5b2.onrender.com/api";

function AdminLogin() {
  const navigate = useNavigate();

const [formData, setFormData] = useState({
  phone: "",
  password: "",
});

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        formData
      );

      const data = response.data;
      const token = data.token || data.accessToken;

      const user =
        data.user ||
        data.data?.user ||
        null;

      if (!token) {
        throw new Error(
          "Login token পাওয়া যায়নি"
        );
      }

      if (user && user.role !== "admin") {
        setMessage(
          "এই account-এর admin permission নেই"
        );

        return;
      }

      localStorage.setItem(
  "adminToken",
  token
);

      if (user) {
        localStorage.setItem(
          "adminUser",
          JSON.stringify(user)
        );
      }

      navigate("/admin/dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Admin login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          EA
        </div>

        <h1>Admin Login</h1>

        <p className="admin-login-subtitle">
          Investment Platform Administration
        </p>

        {message && (
          <div className="admin-login-message">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
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
              maxLength={15}
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;