import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://earnapp-n5b2.onrender.com/api";


const formatDate = (date) =>
  date
    ? new Date(date).toLocaleString("en-BD", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";



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

      const response = await axios.get(
        `${API_URL}/admin/withdraws`,
        getAuthConfig(),
      );

      const withdrawList =
        response.data.withdraws ||
        response.data.transactions ||
        response.data.data ||
        [];

      setWithdraws(Array.isArray(withdrawList) ? withdrawList : []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Withdraws load failed");

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
    loadWithdraws();
  }, [loadWithdraws]);

  
const [withdrawSearch, setWithdrawSearch] = useState("");
const [activeWithdrawSearch, setActiveWithdrawSearch] = useState("");

const filteredWithdraws = useMemo(() => {
  const query = activeWithdrawSearch.trim().toLowerCase();

  return withdraws.filter((withdraw) => {
    const statusMatched =
      !statusFilter ||
      (withdraw.status || "pending") === statusFilter;

    const accountNumber =
      withdraw.accountNumber ||
      withdraw.phoneNumber ||
      withdraw.paymentNumber ||
      withdraw.note ||
      "";

    const searchText = [
      withdraw.userId?.username,
      withdraw.userId?.name,
      withdraw.userId?.email,
      withdraw.userId?.phone,
      accountNumber,
      withdraw.paymentMethod,
      withdraw.method,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return statusMatched && (!query || searchText.includes(query));
  });
}, [activeWithdrawSearch, statusFilter, withdraws]);

  const approveWithdraw = async (transactionId) => {
    try {
      setActionLoading(transactionId);
      setMessage("");

      const response = await axios.patch(
        `${API_URL}/admin/withdraws/${transactionId}/approve`,
        {},
        getAuthConfig(),
      );

      setMessage(response.data.message || "Withdraw approved successfully");
      await loadWithdraws();
    } catch (error) {
      setMessage(error.response?.data?.message || "Withdraw approve failed");
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
        getAuthConfig(),
      );

      setMessage(response.data.message || "Withdraw rejected successfully");
      await loadWithdraws();
    } catch (error) {
      setMessage(error.response?.data?.message || "Withdraw reject failed");
    } finally {
      setActionLoading("");
    }
  };

  const handleWithdrawSearch = (event) => {
  event.preventDefault();
  setActiveWithdrawSearch(withdrawSearch.trim());
};

const clearWithdrawSearch = () => {
  setWithdrawSearch("");
  setActiveWithdrawSearch("");
};

  const renderActions = (withdraw) =>
    withdraw.status === "pending" ? (
      <div className="admin-action-group">
        <button
          type="button"
          className="admin-approve-button"
          disabled={actionLoading === withdraw._id}
          onClick={() => approveWithdraw(withdraw._id)}
        >
          {actionLoading === withdraw._id ? "Processing..." : "Approve"}
        </button>

        <button
          type="button"
          className="admin-reject-button"
          disabled={actionLoading === withdraw._id}
          onClick={() => rejectWithdraw(withdraw._id)}
        >
          Reject
        </button>
      </div>
    ) : (
      <span className="admin-no-action">Completed</span>
    );

  return (
    <main className="admin-page admin-withdraw-page">
      <header className="admin-page-header">
        <div>
          <h1>Withdraw</h1>
        </div>

        <button
          type="button"
          className="admin-back-button"
          onClick={() => navigate("/admin/dashboard")}
        >
          Dashboard
        </button>
      </header>

      <div className="admin-filter-group admin-withdraw-filter-group">
        {[
          ["pending", "Pending"],
          ["", "All"],
          ["approved", "Approved"],
          ["rejected", "Rejected"],
        ].map(([value, label]) => (
          <button
            type="button"
            className={statusFilter === value ? "active" : ""}
            onClick={() => setStatusFilter(value)}
            key={label}
          >
            {label}
          </button>
        ))}
      </div>

<form
  className="admin-deposit-search"
  onSubmit={handleWithdrawSearch}
>
  <div>
    <label htmlFor="withdraw-search">
      Search Withdraw Request
    </label>

    <input
      id="withdraw-search"
      type="search"
      value={withdrawSearch}
      onChange={(event) => setWithdrawSearch(event.target.value)}
      placeholder="User, phone or account number"
      autoComplete="off"
    />
  </div>

  <button type="submit">Search</button>

  {activeWithdrawSearch && (
    <button
      type="button"
      className="admin-clear-search"
      onClick={clearWithdrawSearch}
    >
      Clear
    </button>
  )}
</form>

      {message && <div className="admin-page-message">{message}</div>}

      {loading ? (
        <div className="admin-loading">Loading withdraws...</div>
      ) : filteredWithdraws.length === 0 ? (
        <div className="admin-empty">No withdraw requests found</div>
      ) : (
        <>
          <div className="admin-list-summary">
            <span>{filteredWithdraws.length} withdraw request(s) found</span>
            <strong>{statusFilter || "all"}</strong>
          </div>

          <section className="admin-mobile-request-list">
            {filteredWithdraws.map((withdraw) => {
              const accountNumber =
                withdraw.accountNumber ||
                withdraw.phoneNumber ||
                withdraw.paymentNumber ||
                withdraw.note ||
                "-";

              return (
                <article
                  className="admin-mobile-request-card"
                  key={withdraw._id}
                >
                  <div className="admin-mobile-request-top">
                    <div>
                      <small>Withdraw request</small>
                      <strong>
                        {withdraw.userId?.username ||
                          withdraw.userId?.email ||
                          "Unknown user"}
                      </strong>
                    </div>

                    <span
                      className={`admin-status admin-status-${
                        withdraw.status || "pending"
                      }`}
                    >
                      {withdraw.status || "pending"}
                    </span>
                  </div>

                  <div className="admin-mobile-request-amount">
                    ৳{Number(withdraw.amount || 0).toLocaleString("en-BD")}
                    <span>
                      {withdraw.paymentMethod ||
                        withdraw.method ||
                        "Payment"}
                    </span>
                  </div>

                  <div className="admin-mobile-request-info">
                    <span>Account: {accountNumber}</span>
                    <span>Phone: {withdraw.userId?.phone || "-"}</span>
                    <span>{formatDate(withdraw.createdAt)}</span>
                  </div>

                  {renderActions(withdraw)}
                </article>
              );
            })}
          </section>

          <div className="admin-table-wrapper admin-desktop-table">
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
                {filteredWithdraws.map((withdraw) => (
                  <tr key={withdraw._id}>
                    <td>
                      {withdraw.userId?.username ||
                        withdraw.userId?.email ||
                        "Unknown"}
                    </td>

                    <td>{withdraw.userId?.phone || "-"}</td>

                    <td>৳{withdraw.amount || 0}</td>

                    <td>
                      {withdraw.paymentMethod || withdraw.method || "-"}
                    </td>

                    <td>
                      {withdraw.accountNumber ||
                        withdraw.phoneNumber ||
                        withdraw.paymentNumber ||
                        withdraw.note ||
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

                    <td>{formatDate(withdraw.createdAt)}</td>

                    <td>{renderActions(withdraw)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

export default Withdraws;