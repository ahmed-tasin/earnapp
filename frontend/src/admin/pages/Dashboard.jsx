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

const defaultStats = {
  totalUsers: 0,
  activeUsers: 0,
  suspendedUsers: 0,
  totalPackages: 0,
  activeInvestments: 0,
  completedInvestments: 0,
  pendingDeposits: 0,
  approvedDeposits: 0,
  pendingWithdraws: 0,
  approvedWithdraws: 0,
  totalDepositAmount: 0,
  totalWithdrawAmount: 0,
  totalProfitPaid: 0,
};

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-BD");

const formatMoney = (value) =>
  `৳${Number(value || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      try {
        setMessage("");
        isRefresh ? setRefreshing(true) : setLoading(true);

        const token = localStorage.getItem("adminToken");

        if (!token) {
          navigate("/admin/login", {
            replace: true,
          });
          return;
        }

        const response = await axios.get(
          `${API_URL}/admin/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const dashboardData =
          response.data?.dashboard ||
          response.data?.stats ||
          response.data?.data?.dashboard ||
          response.data?.data ||
          {};

        setStats(
          Object.keys(defaultStats).reduce(
            (normalized, key) => ({
              ...normalized,
              [key]: Number(dashboardData?.[key] || 0),
            }),
            {},
          ),
        );

        setLastUpdated(new Date());
      } catch (error) {
        console.error(
          "Dashboard load error:",
          error.response?.data || error.message,
        );

        setMessage(
          error.response?.data?.message ||
            "Dashboard data load failed",
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
        setRefreshing(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const pendingRequests =
    stats.pendingDeposits + stats.pendingWithdraws;

  const totalInvestments =
    stats.activeInvestments + stats.completedInvestments;

  const activeUserRate = stats.totalUsers
    ? Math.round(
        (stats.activeUsers / stats.totalUsers) * 100,
      )
    : 0;

  const investmentCompletionRate = totalInvestments
    ? Math.round(
        (stats.completedInvestments / totalInvestments) *
          100,
      )
    : 0;

  const metricCards = useMemo(
    () => [
      {
        label: "Total Users",
        value: formatNumber(stats.totalUsers),
        detail: `${formatNumber(
          stats.activeUsers,
        )} active users`,
        icon: "👥",
        tone: "green",
        route: "/admin/users",
      },
      {
        label: "Active Investments",
        value: formatNumber(stats.activeInvestments),
        detail: `${formatNumber(
          stats.completedInvestments,
        )} completed`,
        icon: "📈",
        tone: "blue",
        route: "/admin/investments",
      },
      {
        label: "Pending Deposits",
        value: formatNumber(stats.pendingDeposits),
        detail: `${formatNumber(
          stats.approvedDeposits,
        )} approved`,
        icon: "↓",
        tone: "amber",
        route: "/admin/deposits",
      },
      {
        label: "Pending Withdraws",
        value: formatNumber(stats.pendingWithdraws),
        detail: `${formatNumber(
          stats.approvedWithdraws,
        )} approved`,
        icon: "↑",
        tone: "red",
        route: "/admin/withdraws",
      },
    ],
    [stats],
  );

  const quickActions = [
    {
      label: "Manage Users",
      detail: "Search and update accounts",
      icon: "👤",
      route: "/admin/users",
    },
    {
      label: "Manage Packages",
      detail: "Create and update plans",
      icon: "▣",
      route: "/admin/packages",
    },
    {
      label: "Review Deposits",
      detail: `${stats.pendingDeposits} waiting`,
      icon: "↓",
      route: "/admin/deposits",
    },
    {
      label: "Review Withdraws",
      detail: `${stats.pendingWithdraws} waiting`,
      icon: "↑",
      route: "/admin/withdraws",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    navigate("/admin/login", {
      replace: true,
    });
  };

  return (
    <main className="admin-page admin-dashboard">
      <header className="admin-dashboard-hero">
        <div>
          <span className="admin-dashboard-eyebrow">
            NVIDIA FINANCE
          </span>
          <h1>Admin Dashboard</h1>
          <p>
            Monitor platform activity and manage daily
            operations.
          </p>
        </div>

        <div className="admin-dashboard-header-actions">
          <button
            type="button"
            className="admin-dashboard-refresh"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
          >
            <span className={refreshing ? "rotating" : ""}>
              ↻
            </span>
            {refreshing ? "Refreshing" : "Refresh"}
          </button>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {message && (
        <div className="admin-page-message admin-message-error">
          {message}
        </div>
      )}

      {loading ? (
        <div className="admin-dashboard-loading">
          <span />
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <>
          <section className="admin-dashboard-welcome">
            <div>
              <span>Platform overview</span>
              <strong>
                {pendingRequests > 0
                  ? `${pendingRequests} requests need attention`
                  : "Everything is up to date"}
              </strong>
            </div>
            <small>
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString(
                    "en-BD",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}`
                : "Latest platform data"}
            </small>
          </section>

          <section
            className="admin-dashboard-grid"
            aria-label="Platform metrics"
          >
            {metricCards.map((card) => (
              <button
                type="button"
                className={`admin-dashboard-card admin-dashboard-card-${card.tone}`}
                onClick={() => navigate(card.route)}
                key={card.label}
              >
                <span className="admin-dashboard-card-icon">
                  {card.icon}
                </span>
                <span className="admin-dashboard-card-label">
                  {card.label}
                </span>
                <strong>{card.value}</strong>
                <small>{card.detail}</small>
                <span className="admin-dashboard-card-arrow">
                  →
                </span>
              </button>
            ))}
          </section>

          <section className="admin-dashboard-content-grid">
            <article className="admin-dashboard-panel">
              <div className="admin-dashboard-panel-heading">
                <div>
                  <span>Financial summary</span>
                  <h2>Platform Funds</h2>
                </div>
                <span className="admin-dashboard-live">
                  Live totals
                </span>
              </div>

              <div className="admin-finance-list">
                <div>
                  <span className="admin-finance-icon deposit">
                    ↓
                  </span>
                  <div>
                    <small>Total Deposits</small>
                    <strong>
                      {formatMoney(stats.totalDepositAmount)}
                    </strong>
                  </div>
                </div>

                <div>
                  <span className="admin-finance-icon withdraw">
                    ↑
                  </span>
                  <div>
                    <small>Total Withdrawals</small>
                    <strong>
                      {formatMoney(
                        stats.totalWithdrawAmount,
                      )}
                    </strong>
                  </div>
                </div>

                <div>
                  <span className="admin-finance-icon profit">
                    ৳
                  </span>
                  <div>
                    <small>Total Profit Paid</small>
                    <strong>
                      {formatMoney(stats.totalProfitPaid)}
                    </strong>
                  </div>
                </div>
              </div>
            </article>

            <article className="admin-dashboard-panel">
              <div className="admin-dashboard-panel-heading">
                <div>
                  <span>Health indicators</span>
                  <h2>Platform Status</h2>
                </div>
              </div>

              <div className="admin-health-item">
                <div>
                  <span>Active users</span>
                  <strong>{activeUserRate}%</strong>
                </div>
                <div className="admin-health-track">
                  <span
                    style={{
                      width: `${activeUserRate}%`,
                    }}
                  />
                </div>
                <small>
                  {formatNumber(stats.activeUsers)} active ·{" "}
                  {formatNumber(stats.suspendedUsers)} suspended
                </small>
              </div>

              <div className="admin-health-item">
                <div>
                  <span>Investment completion</span>
                  <strong>
                    {investmentCompletionRate}%
                  </strong>
                </div>
                <div className="admin-health-track blue">
                  <span
                    style={{
                      width: `${investmentCompletionRate}%`,
                    }}
                  />
                </div>
                <small>
                  {formatNumber(totalInvestments)} total
                  investments
                </small>
              </div>

              <div className="admin-dashboard-mini-stats">
                <div>
                  <span>Packages</span>
                  <strong>
                    {formatNumber(stats.totalPackages)}
                  </strong>
                </div>
                <div>
                  <span>Pending</span>
                  <strong>{pendingRequests}</strong>
                </div>
              </div>
            </article>
          </section>

          <section className="admin-dashboard-quick-section">
            <div className="admin-dashboard-section-heading">
              <div>
                <span>Navigation</span>
                <h2>Quick Actions</h2>
              </div>
            </div>

            <div className="admin-dashboard-actions">
              {quickActions.map((action) => (
                <button
                  type="button"
                  onClick={() => navigate(action.route)}
                  key={action.label}
                >
                  <span>{action.icon}</span>
                  <div>
                    <strong>{action.label}</strong>
                    <small>{action.detail}</small>
                  </div>
                  <b>→</b>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default Dashboard;
