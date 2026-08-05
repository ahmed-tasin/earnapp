import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

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

function Deposits() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTrxId = searchParams.get("trxId") || "";

  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");
  const [trxId, setTrxId] = useState(initialTrxId);
  const [activeTrxId, setActiveTrxId] = useState(initialTrxId);

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

      const query = activeTrxId
        ? `?trxId=${encodeURIComponent(activeTrxId)}`
        : "";

      const response = await axios.get(
        `${API_URL}/admin/deposits${query}`,
        getAuthConfig(),
      );

      const depositList =
        response.data.deposits ||
        response.data.transactions ||
        response.data.data ||
        [];

      setDeposits(Array.isArray(depositList) ? depositList : []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Deposits load failed");

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
  }, [activeTrxId, getAuthConfig, navigate]);

  useEffect(() => {
    loadDeposits();
  }, [loadDeposits]);

  const handleSearch = (event) => {
    event.preventDefault();

    const cleanTrxId = trxId.trim();

    setActiveTrxId(cleanTrxId);
    setSearchParams(cleanTrxId ? { trxId: cleanTrxId } : {});
  };

  const clearSearch = () => {
    setTrxId("");
    setActiveTrxId("");
    setSearchParams({});
  };

  const approveDeposit = async (transactionId) => {
    try {
      setActionLoading(transactionId);
      setMessage("");

      const response = await axios.patch(
        `${API_URL}/admin/deposits/${transactionId}/approve`,
        {},
        getAuthConfig(),
      );

      setMessage(response.data.message || "Deposit approved successfully");

      await loadDeposits();
    } catch (error) {
      setMessage(error.response?.data?.message || "Deposit approve failed");
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
        getAuthConfig(),
      );

      setMessage(response.data.message || "Deposit rejected successfully");

      await loadDeposits();
    } catch (error) {
      setMessage(error.response?.data?.message || "Deposit reject failed");
    } finally {
      setActionLoading("");
    }
  };

  const renderActions = (deposit) =>
    deposit.status === "pending" ? (
      <div className="admin-action-group">
        <button
          type="button"
          className="admin-approve-button"
          disabled={actionLoading === deposit._id}
          onClick={() => approveDeposit(deposit._id)}
        >
          {actionLoading === deposit._id ? "Processing..." : "Approve"}
        </button>

        <button
          type="button"
          className="admin-reject-button"
          disabled={actionLoading === deposit._id}
          onClick={() => rejectDeposit(deposit._id)}
        >
          Reject
        </button>
      </div>
    ) : (
      <span className="admin-no-action">Completed</span>
    );

  return (
    <main className="admin-page admin-deposit-page">
      <header className="admin-page-header">
        <div>

          <h1>Deposits</h1>

        </div>

        <button
          type="button"
          className="admin-back-button"
          onClick={() => navigate("/admin/dashboard")}
        >
          Dashboard
        </button>
      </header>

      <form className="admin-deposit-search" onSubmit={handleSearch}>
        <div>
          <label htmlFor="deposit-trx-id">Transaction ID</label>

          <input
            id="deposit-trx-id"
            type="search"
            value={trxId}
            onChange={(event) => setTrxId(event.target.value)}
            placeholder="Enter bKash / Nagad Trx ID"
            autoComplete="off"
          />
        </div>

        <button type="submit">Search</button>

        {activeTrxId && (
          <button
            type="button"
            className="admin-clear-search"
            onClick={clearSearch}
          >
            Clear
          </button>
        )}
      </form>

      {message && <div className="admin-page-message">{message}</div>}

      {loading ? (
        <div className="admin-loading">Loading deposits...</div>
      ) : deposits.length === 0 ? (
        <div className="admin-empty">
          {activeTrxId
            ? `No deposit found for: ${activeTrxId}`
            : "No deposits found"}
        </div>
      ) : (
        <>
          <div className="admin-list-summary">
            <span>{deposits.length} deposit request(s) found</span>

            {activeTrxId && <strong>Search: {activeTrxId}</strong>}
          </div>

          <section className="admin-mobile-request-list">
            {deposits.map((deposit) => (
              <article className="admin-mobile-request-card" key={deposit._id}>
                <div className="admin-mobile-request-top">
                  <div>
                    <small>Transaction ID</small>
                    <strong>{deposit.trxId || "-"}</strong>
                  </div>

                  <span
                    className={`admin-status admin-status-${
                      deposit.status || "pending"
                    }`}
                  >
                    {deposit.status || "pending"}
                  </span>
                </div>

                <div className="admin-mobile-request-amount">
                  ৳{Number(deposit.amount || 0).toLocaleString("en-BD")}
                  <span>{deposit.paymentMethod || "Payment"}</span>
                </div>

                <div className="admin-mobile-request-info">
                  <span>
                    {deposit.userId?.username ||
                      deposit.userId?.email ||
                      "Unknown user"}
                  </span>

                  <span>
                    {deposit.userId?.phone ||
                      deposit.contactPhone ||
                      "-"}
                  </span>

                  <span>{formatDate(deposit.createdAt)}</span>
                </div>

                {renderActions(deposit)}
              </article>
            ))}
          </section>

          <div className="admin-table-wrapper admin-desktop-table">
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

                    <td>
                      {deposit.userId?.phone ||
                        deposit.contactPhone ||
                        "-"}
                    </td>

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

                    <td>{formatDate(deposit.createdAt)}</td>

                    <td>{renderActions(deposit)}</td>
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

export default Deposits;