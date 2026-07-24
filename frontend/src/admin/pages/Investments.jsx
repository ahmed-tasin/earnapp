import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://earnapp-n5b2.onrender.com/api";

function Investments() {
  const navigate = useNavigate();

  const [investments, setInvestments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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

        navigate("/admin/login", {
          replace: true,
        });
      }
    },
    [navigate]
  );

  const loadInvestments = (async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        navigate("/admin/login", {
          replace: true,
        });

        return;
      }

      const response = await axios.get(
        `${API_URL}/admin/investments`,
        
        getAuthConfig()
      );

      const investmentList =
        response.data?.investments ||
        response.data?.data?.investments ||
        response.data?.data ||
        [];

      setInvestments(
        Array.isArray(investmentList)
          ? investmentList
          : []
      );
    } catch (error) {
      console.error(
        "Investments load error:",
        error
      );

      handleAuthError(error);

      setMessage(
        error.response?.data?.message ||
          "Investments load failed"
      );
    } finally {
      setLoading(false);
    }
  }, [
    getAuthConfig,
    handleAuthError,
    navigate,
  ]);

  useEffect(() => {
    loadInvestments();
  }, [loadInvestments]);

  const filteredInvestments = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return investments.filter((investment) => {
      const username =
        investment.userId?.username ||
        investment.user?.username ||
        "";

      const phone =
        investment.userId?.phone ||
        investment.user?.phone ||
        "";

      const email =
        investment.userId?.email ||
        investment.user?.email ||
        "";

      const packageName =
        investment.packageId?.name ||
        investment.package?.name ||
        "";

      const status =
        investment.status || "active";

      const matchesSearch =
        !keyword ||
        username
          .toLowerCase()
          .includes(keyword) ||
        phone
          .toLowerCase()
          .includes(keyword) ||
        email
          .toLowerCase()
          .includes(keyword) ||
        packageName
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    investments,
    search,
    statusFilter,
  ]);

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString();
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Investments</h1>

          <p>
            Monitor all user investments
          </p>
        </div>

        <button
          type="button"
          className="admin-back-button"
          onClick={() =>
            navigate("/admin/dashboard")
          }
        >
          Dashboard
        </button>
      </div>

      {message && (
        <div className="admin-page-message admin-message-error">
          {message}
        </div>
      )}

      <div className="admin-investment-controls">
        <div className="admin-search-wrapper">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search username, phone, email or package"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="admin-filter-group">
          <button
            type="button"
            className={
              statusFilter === "all"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("all")
            }
          >
            All
          </button>

          <button
            type="button"
            className={
              statusFilter === "active"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("active")
            }
          >
            Active
          </button>

          <button
            type="button"
            className={
              statusFilter === "completed"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("completed")
            }
          >
            Completed
          </button>

          <button
            type="button"
            className={
              statusFilter === "cancelled"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("cancelled")
            }
          >
            Cancelled
          </button>
        </div>
      </div>

      <div className="admin-list-summary">
        <span>
          Total Investments:{" "}
          <strong>
            {filteredInvestments.length}
          </strong>
        </span>

        <button
          type="button"
          className="admin-refresh-button"
          onClick={loadInvestments}
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">
          Loading investments...
        </div>
      ) : filteredInvestments.length ===
        0 ? (
        <div className="admin-empty">
          No investments found
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Package</th>
                <th>Amount</th>
                <th>Daily Return</th>
                <th>Total Days</th>
                <th>Remaining Days</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvestments.map(
                (investment) => {
                  const user =
                    investment.userId ||
                    investment.user ||
                    {};

                  const packageInfo =
                    investment.packageId ||
                    investment.package ||
                    {};

                  const investmentAmount =
                    investment.investmentAmount ??
                    investment.amount ??
                    packageInfo.amount ??
                    0;

                  const dailyReturn =
                    investment.dailyReturn ??
                    packageInfo.dailyReturn ??
                    0;

                  const totalDays =
                    investment.totalDays ??
                    packageInfo.totalDays ??
                    0;

                  const remainingDays =
                    investment.remainingDays ??
                    0;

                  const status =
                    investment.status ||
                    "active";

                  return (
                    <tr
                      key={investment._id}
                    >
                      <td>
                        <div className="admin-user-cell">
                          <strong>
                            {user.username ||
                              "Unknown User"}
                          </strong>

                          <small>
                            {user.email || "-"}
                          </small>
                        </div>
                      </td>

                      <td>
                        {user.phone || "-"}
                      </td>

                      <td>
                        {packageInfo.name ||
                          "Unknown Package"}
                      </td>

                      <td>
                        ৳
                        {formatAmount(
                          investmentAmount
                        )}
                      </td>

                      <td>
                        ৳
                        {formatAmount(
                          dailyReturn
                        )}
                      </td>

                      <td>
                        {totalDays} days
                      </td>

                      <td>
                        {remainingDays} days
                      </td>

                      <td>
                        <span
                          className={`admin-status admin-status-${status}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          investment.startDate ||
                            investment.createdAt
                        )}
                      </td>

                      <td>
                        {formatDate(
                          investment.endDate
                        )}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Investments;