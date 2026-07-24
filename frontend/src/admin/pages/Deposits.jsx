import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://earnapp-n5b2.onrender.com/api";

function Deposits() {
  const navigate = useNavigate();

  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("adminToken");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, []);

  const loadDeposits = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get(
        `${API_URL}/admin/deposits`,
        getAuthConfig()
      );

      // Backend response দুইভাবে থাকলেও কাজ করবে
      const depositList =
        response.data.deposits ||
        response.data.transactions ||
        response.data.data ||
        [];

      setDeposits(Array.isArray(depositList) ? depositList : []);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Deposits load failed";

      setMessage(errorMessage);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig, navigate]);

  useEffect(() => {
    loadDeposits();
  }, [loadDeposits]);

  const approveDeposit = async (transactionId) => {
    try {
      setActionLoading(transactionId);
      setMessage("");

      const response = await axios.patch(
        `${API_URL}/admin/deposits/${transactionId}/approve`,
        {},
        getAuthConfig()
      );

      setMessage(
        response.data.message || "Deposit approved successfully"
      );

      await loadDeposits();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Deposit approve failed"
      );
    } finally {
      setActionLoading("");
    }
  };

  const rejectDeposit = async (transactionId) => {
    try {
      setActionLoading(transactionId);
      setMessage("");

      const response = await axios.patch(
        `${API_URL}/admin/deposits/${transactionId}/reject`,
        {},
        getAuthConfig()
      );

      setMessage(
        response.data.message || "Deposit rejected successfully"
      );

      await loadDeposits();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Deposit reject failed"
      );
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Deposits</h1>
          <p>Manage user deposit requests</p>
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
        <div className="admin-page-message">{message}</div>
      )}

      {loading ? (
        <div className="admin-loading">
          Loading deposits...
        </div>
      ) : deposits.length === 0 ? (
        <div className="admin-empty">
          No deposits found
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Trx ID</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {deposits.map((deposit) => (
                <tr key={deposit._id}>
                  <td>
                    {deposit.userId?.username ||
                      deposit.userId?.email ||
                      "Unknown"}
                  </td>

                  <td>{deposit.userId?.phone || "-"}</td>

                  <td>৳{deposit.amount || 0}</td>

                  <td>{deposit.paymentMethod || "-"}</td>

                  <td>{deposit.trxId || "-"}</td>

                  <td>
                    <span
                      className={`admin-status admin-status-${
                        deposit.status || "pending"
                      }`}
                    >
                      {deposit.status || "pending"}
                    </span>
                  </td>

                  <td>
                    {deposit.createdAt
                      ? new Date(deposit.createdAt).toLocaleString()
                      : "-"}
                  </td>

                  <td>
                    {deposit.status === "pending" ? (
                      <div className="admin-action-group">
                        <button
                          type="button"
                          className="admin-approve-button"
                          disabled={actionLoading === deposit._id}
                          onClick={() =>
                            approveDeposit(deposit._id)
                          }
                        >
                          {actionLoading === deposit._id
                            ? "Processing..."
                            : "Approve"}
                        </button>

                        <button
                          type="button"
                          className="admin-reject-button"
                          disabled={actionLoading === deposit._id}
                          onClick={() =>
                            rejectDeposit(deposit._id)
                          }
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Deposits;