import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://earnapp-n5b2.onrender.com/api";

function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
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

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get(
        `${API_URL}/admin/users`,
        getAuthConfig()
      );

      const userList =
        response.data.users ||
        response.data.data ||
        [];

      setUsers(Array.isArray(userList) ? userList : []);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Users load failed"
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
  }, [getAuthConfig, navigate]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();

    return (
      user.username?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword) ||
      user.phone?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Users</h1>
          <p>Manage registered users</p>
        </div>

        <button
          type="button"
          className="admin-back-button"
          onClick={() => navigate("/admin/dashboard")}
        >
          Dashboard
        </button>
      </div>

      <div className="admin-search-wrapper">
        <input
          type="text"
          className="admin-search-input"
          placeholder="Search by username, email or phone"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {message && (
        <div className="admin-page-message">
          {message}
        </div>
      )}

      {loading ? (
        <div className="admin-loading">
          Loading users...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="admin-empty">
          No users found
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Balance</th>
                <th>Total Deposit</th>
                <th>Total Withdraw</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.username || "-"}</td>

                  <td>{user.email || "-"}</td>

                  <td>{user.phone || "-"}</td>

                  <td>৳{user.balance || 0}</td>

                  <td>৳{user.totalDeposit || 0}</td>

                  <td>৳{user.totalWithdraw || 0}</td>

                  <td>
                    <span className="admin-role-badge">
                      {user.role || "user"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`admin-status admin-status-${
                        user.status || "active"
                      }`}
                    >
                      {user.status || "active"}
                    </span>
                  </td>

                  <td>
                    {user.createdAt
                      ? new Date(
                          user.createdAt
                        ).toLocaleDateString()
                      : "-"}
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

export default Users;