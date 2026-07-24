
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://earnapp-n5b2.onrender.com/api";

const defaultStats = {
  totalUsers: 0,
  pendingDeposits: 0,
  pendingWithdraws: 0,
  activeInvestments: 0,
};

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const response = await axios.get(
        `${API_URL}/admin/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dashboardData =
        response.data?.stats ||
        response.data?.data ||
        response.data ||
        {};

      setStats({
        totalUsers: Number(
          dashboardData?.totalUsers || 0
        ),

        pendingDeposits: Number(
          dashboardData?.pendingDeposits || 0
        ),

        pendingWithdraws: Number(
          dashboardData?.pendingWithdraws || 0
        ),

        activeInvestments: Number(
          dashboardData?.activeInvestments || 0
        ),
      });
    } catch (error) {
      console.error("Dashboard load error:", error);

      setStats(defaultStats);

      setMessage(
        error.response?.data?.message ||
          "Dashboard data load failed"
      );

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
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    navigate("/admin/login", {
      replace: true,
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage your investment platform</p>
        </div>

        <button
          type="button"
          className="admin-logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {message && (
        <div className="admin-page-message admin-message-error">
          {message}
        </div>
      )}

      {loading ? (
        <div className="admin-loading">
          Loading dashboard...
        </div>
      ) : (
        <>
          <div className="admin-dashboard-grid">
            <div
              className="admin-dashboard-card admin-clickable-card"
              onClick={() => navigate("/admin/users")}
            >
              <span>Total Users</span>

              <strong>
                {stats?.totalUsers ?? 0}
              </strong>
            </div>

            <div
              className="admin-dashboard-card admin-clickable-card"
              onClick={() => navigate("/admin/deposits")}
            >
              <span>Pending Deposits</span>

              <strong>
                {stats?.pendingDeposits ?? 0}
              </strong>
            </div>

            <div
              className="admin-dashboard-card admin-clickable-card"
              onClick={() => navigate("/admin/withdraws")}
            >
              <span>Pending Withdraws</span>

              <strong>
                {stats?.pendingWithdraws ?? 0}
              </strong>
            </div>

            <div
  className="admin-dashboard-card admin-clickable-card"
  onClick={() =>
    navigate("/admin/investments")
  }
>
  <span>Active Investments</span>

  <strong>
    {stats?.activeInvestments ?? 0}
  </strong>
</div>


            <div className="admin-dashboard-card">
              <span>Active Investments</span>

              <strong>
                {stats?.activeInvestments ?? 0}
              </strong>
            </div>
          </div>

          <div className="admin-dashboard-actions">
            <button
              type="button"
              onClick={() =>
                navigate("/admin/packages")
              }
            >
              Manage Packages
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/users")
              }
            >
              Manage Users
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/deposits")
              }
            >
              Manage Deposits
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/withdraws")
              }
            >
              Manage Withdraws
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;

