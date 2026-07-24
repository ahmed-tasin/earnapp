import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://earnapp-n5b2.onrender.com/api";

const initialForm = {
  name: "",
  amount: "",
  dailyReturn: "",
  totalDays: "",
};

function Packages() {
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("adminToken");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, []);

  const handleAuthError = useCallback(
    (error) => {
      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
      }
    },
    [navigate]
  );

  const loadPackages = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get(
        `${API_URL}/packages`,
        getAuthConfig()
      );

      const packageList =
        response.data.packages ||
        response.data.data?.packages ||
        response.data.data ||
        [];

      setPackages(
        Array.isArray(packageList) ? packageList : []
      );
    } catch (error) {
      handleAuthError(error);

      setMessageType("error");
      setMessage(
        error.response?.data?.message ||
          "Packages load failed"
      );
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig, handleAuthError]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const createPackage = async (event) => {
    event.preventDefault();

    const amount = Number(formData.amount);
    const dailyReturn = Number(formData.dailyReturn);
    const totalDays = Number(formData.totalDays);

    if (
      !formData.name.trim() ||
      amount <= 0 ||
      dailyReturn <= 0 ||
      totalDays <= 0
    ) {
      setMessageType("error");
      setMessage("Please enter valid package information");
      return;
    }

    try {
      setCreating(true);
      setMessage("");

      const payload = {
        name: formData.name.trim(),
        amount,
        dailyReturn,
        totalDays,
        status: "active",
      };

      const response = await axios.post(
        `${API_URL}/packages/create`,
        payload,
        getAuthConfig()
      );

      setMessageType("success");
      setMessage(
        response.data.message ||
          "Package created successfully"
      );

      setFormData(initialForm);

      await loadPackages();
    } catch (error) {
      handleAuthError(error);

      setMessageType("error");
      setMessage(
        error.response?.data?.message ||
          "Package creation failed"
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Packages</h1>
          <p>Create and manage investment packages</p>
        </div>

        <button
          type="button"
          className="admin-back-button"
          onClick={() => navigate("/admin/dashboard")}
        >
          Dashboard
        </button>
      </div>

      {message && (
        <div
          className={`admin-page-message ${
            messageType === "error"
              ? "admin-message-error"
              : "admin-message-success"
          }`}
        >
          {message}
        </div>
      )}

      <form
        className="admin-package-form"
        onSubmit={createPackage}
      >
        <div className="admin-form-field">
          <label htmlFor="name">
            Package Name
          </label>

          <input
            id="name"
            type="text"
            name="name"
            placeholder="Starter Package"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admin-form-field">
          <label htmlFor="amount">
            Investment Amount
          </label>

          <input
            id="amount"
            type="number"
            name="amount"
            min="1"
            placeholder="1000"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admin-form-field">
          <label htmlFor="dailyReturn">
            Daily Return
          </label>

          <input
            id="dailyReturn"
            type="number"
            name="dailyReturn"
            min="0.01"
            step="0.01"
            placeholder="50"
            value={formData.dailyReturn}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admin-form-field">
          <label htmlFor="totalDays">
            Total Days
          </label>

          <input
            id="totalDays"
            type="number"
            name="totalDays"
            min="1"
            placeholder="30"
            value={formData.totalDays}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="admin-create-button"
          disabled={creating}
        >
          {creating
            ? "Creating..."
            : "Create Package"}
        </button>
      </form>

      {loading ? (
        <div className="admin-loading">
          Loading packages...
        </div>
      ) : packages.length === 0 ? (
        <div className="admin-empty">
          No packages found
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Daily Return</th>
                <th>Total Days</th>
                <th>Total Return</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {packages.map((packageItem) => {
                const dailyReturn = Number(
                  packageItem.dailyReturn || 0
                );

                const totalDays = Number(
                  packageItem.totalDays || 0
                );

                const totalReturn =
                  dailyReturn * totalDays;

                return (
                  <tr key={packageItem._id}>
                    <td>
                      {packageItem.name || "-"}
                    </td>

                    <td>
                      ৳{packageItem.amount || 0}
                    </td>

                    <td>
                      ৳{dailyReturn}
                    </td>

                    <td>
                      {totalDays} days
                    </td>

                    <td>
                      ৳{totalReturn}
                    </td>

                    <td>
                      <span
                        className={`admin-status admin-status-${
                          packageItem.status || "active"
                        }`}
                      >
                        {packageItem.status || "active"}
                      </span>
                    </td>

                    <td>
                      {packageItem.createdAt
                        ? new Date(
                            packageItem.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Packages;

