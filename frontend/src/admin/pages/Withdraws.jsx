import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://earnapp-n5b2.onrender.com/api";

function Withdraws() {
  const navigate = useNavigate();

  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("adminToken");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, []);

  const loadWithdraws = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const url = statusFilter
        ? `${API_URL}/admin/withdraws?status=${statusFilter}`
        : `${API_URL}/admin/withdraws`;

      const response = await axios.get(url, getAuthConfig());

      const withdrawList =
        response.data.withdraws ||
        response.data.transactions ||
        response.data.data ||
        [];

      setWithdraws(
        Array.isArray(withdrawList) ? withdrawList : []
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Withdraws load failed"
      );

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
  }, [getAuthConfig, navigate, statusFilter]);

  useEffect(() => {
    loadWithdraws();
  }, [loadWithdraws]);

  const approveWithdraw = async (transactionId) => {
    try {
      setActionLoading(transactionId);
      setMessage("");

      const response = await axios.patch(
        `${API_URL}/admin/withdraws/${transactionId}/approve`,
        {},
        getAuthConfig()
      );

      setMessage(
        response.data.message ||
          "Withdraw approved successfully"
      );

      await loadWithdraws();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Withdraw approve failed"
      );
    } finally {
      setActionLoading("");
    }
  };

  const rejectWithdraw = async (transactionId) => {
    try {
      setActionLoading(transactionId);
      setMessage("");

      const response = await axios.patch(
        `${API_URL}/admin/withdraws/${transactionId}/reject`,
        {},
        getAuthConfig()
      );

      setMessage(
        response.data.message ||
          "Withdraw rejected successfully"
      );

      await loadWithdraws();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Withdraw reject failed"
      );
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Withdraws</h1>
          <p>Manage user withdraw requests</p>
        </div>

        <button
          type="button"
          className="admin-back-button"
          onClick={() => navigate("/admin/dashboard")}
        >
          Dashboard
        </button>
      </div>

      <div className="admin-filter-group">
        <button
          type="button"
          className={statusFilter === "" ? "active" : ""}
          onClick={() => setStatusFilter("")}
        >
          All
        </button>

        <button
          type="button"
          className={
            statusFilter === "pending" ? "active" : ""
          }
          onClick={() => setStatusFilter("pending")}
        >
          Pending
        </button>

        <button
          type="button"
          className={
            statusFilter === "approved" ? "active" : ""
          }
          onClick={() => setStatusFilter("approved")}
        >
          Approved
        </button>

        <button
          type="button"
          className={
            statusFilter === "rejected" ? "active" : ""
          }
          onClick={() => setStatusFilter("rejected")}
        >
          Rejected
        </button>
      </div>

      {message && (
        <div className="admin-page-message">{message}</div>
      )}

      {loading ? (
        <div className="admin-loading">
          Loading withdraws...
        </div>
      ) : withdraws.length === 0 ? (
        <div className="admin-empty">
          No withdraw requests found
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
                <th>Account</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {withdraws.map((withdraw) => (
                <tr key={withdraw._id}>
                  <td>
                    {withdraw.userId?.username ||
                      withdraw.userId?.email ||
                      "Unknown"}
                  </td>

                  <td>{withdraw.userId?.phone || "-"}</td>

                  <td>৳{withdraw.amount || 0}</td>

                  <td>
                    {withdraw.paymentMethod ||
                      withdraw.method ||
                      "-"}
                  </td>

                  <td>
                    {withdraw.accountNumber ||
                      withdraw.phoneNumber ||
                      withdraw.paymentNumber ||
                      "-"}
                  </td>

                  <td>
                    <span
                      className={`admin-status admin-status-${
                        withdraw.status || "pending"
                      }`}
                    >
                      {withdraw.status || "pending"}
                    </span>
                  </td>

                  <td>
                    {withdraw.createdAt
                      ? new Date(
                          withdraw.createdAt
                        ).toLocaleString()
                      : "-"}
                  </td>

                  <td>
                    {withdraw.status === "pending" ? (
                      <div className="admin-action-group">
                        <button
                          type="button"
                          className="admin-approve-button"
                          disabled={
                            actionLoading === withdraw._id
                          }
                          onClick={() =>
                            approveWithdraw(withdraw._id)
                          }
                        >
                          {actionLoading === withdraw._id
                            ? "Processing..."
                            : "Approve"}
                        </button>

                        <button
                          type="button"
                          className="admin-reject-button"
                          disabled={
                            actionLoading === withdraw._id
                          }
                          onClick={() =>
                            rejectWithdraw(withdraw._id)
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

export default Withdraws;