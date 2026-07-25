import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../styles/Notifications.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://earnapp-n5b2.onrender.com/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = localStorage.getItem("userToken");

      if (!token) {
        throw new Error("Please login first");
      }

      const response = await axios.get(
        `${API_URL}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      /*
        Supported Response

        {
          notifications:[]
        }

        {
          data:{
            notifications:[]
          }
        }

        {
          data:[]
        }
      */

      const list =
        response.data?.notifications ||
        response.data?.data?.notifications ||
        response.data?.data ||
        [];

      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load notifications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (item) => !item.read && !item.isRead
    ).length;
  }, [notifications]);

  const formatDate = (date) => {
    if (!date) return "";

    return new Intl.DateTimeFormat("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("userToken");

      await axios.patch(
        `${API_URL}/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((item) =>
          (item._id || item.id) === id
            ? {
                ...item,
                read: true,
                isRead: true,
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("userToken");

      await axios.patch(
        `${API_URL}/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          read: true,
          isRead: true,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <main className="notifications-page">
        <div className="notifications-loading">
          <div className="notifications-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="notifications-page">
      <div className="notifications-container">

        <header className="notifications-header">
          <div>
            <p className="notifications-label">
              Latest Updates
            </p>

            <h1>Notifications</h1>
          </div>

          <button
            className="notifications-refresh-button"
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        <section className="notifications-summary">

          <div className="notification-stat">
            <span>Total</span>
            <strong>{notifications.length}</strong>
          </div>

          <div className="notification-stat">
            <span>Unread</span>
            <strong>{unreadCount}</strong>
          </div>

          {notifications.length > 0 && (
            <button
              className="mark-all-button"
              onClick={markAllRead}
            >
              Mark All Read
            </button>
          )}

        </section>

        {error && (
          <div className="notifications-error">
            <p>{error}</p>

            <button
              onClick={() => fetchNotifications(true)}
            >
              Retry
            </button>
          </div>
        )}

        {notifications.length === 0 ? (
          <section className="notifications-empty">

            <div className="empty-icon">
              🔔
            </div>

            <h2>No Notifications</h2>

            <p>
              When deposits, withdrawals,
              investments, referrals or admin
              announcements happen,
              they will appear here.
            </p>

          </section>
        ) : (
          <section className="notifications-list">

            {notifications.map((item, index) => {

              const id =
                item._id ||
                item.id ||
                index;

              const isRead =
                item.read ||
                item.isRead;

              const title =
                item.title ||
                "Notification";

              const message =
                item.message ||
                item.description ||
                "";

              const type =
                (
                  item.type ||
                  "general"
                ).toLowerCase();

              return (
                <article
                  key={id}
                  className={
                    isRead
                      ? "notification-card"
                      : "notification-card unread"
                  }
                >

                  <div
                    className={`notification-icon ${type}`}
                  >
                    {type === "deposit" && "↓"}

                    {type === "withdraw" && "↑"}

                    {type === "investment" && "💰"}

                    {type === "earning" && "★"}

                    {type === "referral" && "👥"}

                    {type === "announcement" && "📢"}

                    {type === "general" && "🔔"}
                  </div>

                  <div className="notification-content">

                    <div className="notification-top">

                      <h3>{title}</h3>

                      {!isRead && (
                        <span className="unread-dot"></span>
                      )}

                    </div>

                    <p>{message}</p>

                    <small>
                      {formatDate(
                        item.createdAt ||
                        item.date
                      )}
                    </small>

                  </div>

                  {!isRead && (
                    <button
                      className="read-button"
                      onClick={() =>
                        markAsRead(id)
                      }
                    >
                      Read
                    </button>
                  )}

                </article>
              );
            })}

          </section>
        )}

      </div>
    </main>
  );
}

export default Notifications;