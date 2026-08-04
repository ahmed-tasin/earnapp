import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import "../styles/CheckIn.css";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://earnapp-n5b2.onrender.com/api";


const REWARD_DAYS = [
  { day: 1, reward: 2 },
  { day: 2, reward: 2 },
  { day: 3, reward: 4 },
  { day: 4, reward: 4 },
  { day: 5, reward: 5 },
  { day: 6, reward: 5 },
  { day: 7, reward: 10 },
];

function CheckIn() {
  const [checkInData, setCheckInData] = useState({
    currentDay: 0,
    streak: 0,
    totalReward: 0,
    todayCheckedIn: false,
    lastCheckIn: null,
  });

  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const getToken = () =>
    localStorage.getItem("userToken") ||
    localStorage.getItem("token");

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    window.setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3500);
  };

  const normalizeCheckInData = (responseData) => {
    const data =
      responseData?.checkIn ||
      responseData?.checkin ||
      responseData?.data?.checkIn ||
      responseData?.data?.checkin ||
      responseData?.data ||
      responseData ||
      {};

    return {
      currentDay:
        Number(data.currentDay ?? data.day ?? data.streakDay) || 0,

      streak:
        Number(data.streak ?? data.currentStreak) || 0,

      totalReward:
        Number(data.totalReward ?? data.totalEarned) || 0,

      todayCheckedIn: Boolean(
        data.todayCheckedIn ??
          data.checkedInToday ??
          data.isCheckedIn
      ),

      lastCheckIn:
        data.lastCheckIn ??
        data.lastCheckin ??
        data.lastCheckInDate ??
        null,
    };
  };

  const fetchCheckInData = useCallback(async (isRefresh = false) => {
    const token = getToken();

    if (!token) {
      setError("Authentication token not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const responses = await Promise.allSettled([
        axios.get(`${API_URL}/checkin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        axios.get(`${API_URL}/wallet`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const checkInResponse = responses[0];

      if (checkInResponse.status === "rejected") {
        throw checkInResponse.reason;
      }

      setCheckInData(
        normalizeCheckInData(checkInResponse.value.data)
      );

      const walletResponse = responses[1];

      if (walletResponse.status === "fulfilled") {
        const walletData =
          walletResponse.value.data?.wallet ||
          walletResponse.value.data?.data?.wallet ||
          walletResponse.value.data?.data ||
          walletResponse.value.data ||
          {};

        setWalletBalance(Number(walletData.balance) || 0);
      }
    } catch (err) {
      console.error(
        "Check-in fetch error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Failed to load check-in information"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCheckInData();
  }, [fetchCheckInData]);

  const handleCheckIn = async () => {
    const token = getToken();

    if (!token) {
      showMessage("Please log in again", "error");
      return;
    }

    if (checkInData.todayCheckedIn) {
      showMessage("You have already checked in today", "error");
      return;
    }

    try {
      setCheckingIn(true);

      const response = await axios.post(
        `${API_URL}/checkin`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedData = normalizeCheckInData(response.data);

      const reward =
        Number(
          response.data?.reward ??
            response.data?.data?.reward ??
            response.data?.checkIn?.reward
        ) || 0;

      const updatedBalance =
        response.data?.wallet?.balance ??
        response.data?.data?.wallet?.balance ??
        response.data?.balance;

      setCheckInData({
        ...updatedData,
        todayCheckedIn: true,
      });

      if (updatedBalance !== undefined) {
        setWalletBalance(Number(updatedBalance) || 0);
      } else if (reward > 0) {
        setWalletBalance(
          (previousBalance) => previousBalance + reward
        );
      }

      showMessage(
        response.data?.message ||
          `Check-in successful. You received ${reward} Tk`
      );
    } catch (err) {
      console.error(
        "Check-in error:",
        err.response?.data || err.message
      );

      showMessage(
        err.response?.data?.message ||
          "Daily check-in failed",
        "error"
      );
    } finally {
      setCheckingIn(false);
    }
  };

  const currentReward = useMemo(() => {
    const nextDay =
      checkInData.currentDay >= 7
        ? 1
        : checkInData.currentDay + 1;

    return (
      REWARD_DAYS.find((item) => item.day === nextDay)?.reward || 2
    );
  }, [checkInData.currentDay]);

  const completedDays = useMemo(() => {
    return Math.min(
      Math.max(Number(checkInData.currentDay) || 0, 0),
      7
    );
  }, [checkInData.currentDay]);

  const progressPercentage = Math.min(
    Math.max((completedDays / 7) * 100, 0),
    100
  );

  const totalCycleReward = REWARD_DAYS.reduce(
    (total, item) => total + item.reward,
    0
  );

  const getDayStatus = (dayNumber) => {
    if (dayNumber <= completedDays) {
      return "completed";
    }

    if (
      dayNumber === completedDays + 1 &&
      !checkInData.todayCheckedIn
    ) {
      return "today";
    }

    return "upcoming";
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  if (loading) {
    return (
      <main className="checkin-page">
        <div className="checkin-loading">
          <div className="checkin-spinner" />
          <p>Loading daily rewards...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="checkin-page">
      <div className="checkin-container">
        <header className="checkin-header">
          <div>
            <p className="checkin-eyebrow">Daily Rewards</p>
            <h1>7-Day Check-in</h1>
          </div>

          {/* <button
            type="button"
            className="checkin-refresh-button"
            onClick={() => fetchCheckInData(true)}
            disabled={refreshing}
          >
            <span className={refreshing ? "rotating" : ""}>
              ↻
            </span>

            {refreshing ? "Refreshing" : "Refresh"}
          </button> */}
        </header>

        {message && (
          <div
            className={`checkin-message ${messageType}`}
            role="alert"
          >
            {message}
          </div>
        )}

        {error && (
          <section className="checkin-error" role="alert">
            <div>
              <strong>Could not load check-in data</strong>
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() => fetchCheckInData(true)}
            >
              Retry
            </button>
          </section>
        )}

        <section className="checkin-hero">
          <div className="checkin-hero-content">
           

            <h2>
              Check in daily.
             
            </h2>

            <p className="checkin-hero-description">
              Complete the full seven-day cycle and earn up to{" "}
              <strong>{totalCycleReward} Tk</strong>.
            </p>

            <div className="checkin-hero-actions">
              <button
                type="button"
                className={
                  checkInData.todayCheckedIn
                    ? "checkin-main-button checked"
                    : "checkin-main-button"
                }
                onClick={handleCheckIn}
                disabled={
                  checkingIn || checkInData.todayCheckedIn
                }
              >
                {checkingIn
                  ? "Processing..."
                  : checkInData.todayCheckedIn
                    ? "Checked In Today"
                    : `Check In +${currentReward} Tk`}
              </button>

              <Link
                to="/wallet"
                className="checkin-wallet-link"
              >
                View Wallet
              </Link>
            </div>
          </div>

          <div className="checkin-progress-area">
            <div
              className="checkin-progress-ring"
              style={{
                "--progress": `${progressPercentage * 3.6}deg`,
              }}
            >
              <div className="checkin-progress-inner">
                <strong>{checkInData.streak}</strong>
                <span>DAY STREAK</span>
                <small>{completedDays}/7 completed</small>
              </div>
            </div>
          </div>
        </section>

        <section className="checkin-rewards-section">
          <div className="checkin-section-header">
            <div>
              <p>Reward Schedule</p>
              <h2>Complete the weekly cycle</h2>
            </div>

            <span>{totalCycleReward} Tk total</span>
          </div>

          <div className="checkin-days-grid">
            {REWARD_DAYS.map((item) => {
              const status = getDayStatus(item.day);

              return (
                <article
                  key={item.day}
                  className={`checkin-day-card ${status} ${
                    item.day === 7 ? "bonus" : ""
                  }`}
                >
                  {item.day === 7 && (
                    <span className="checkin-bonus-badge">
                      Bonus Day
                    </span>
                  )}

                  <div className="checkin-day-number">
                    DAY {String(item.day).padStart(2, "0")}
                  </div>

                  <div className="checkin-day-reward">
                    <strong>{item.reward}</strong>
                    <span>Tk</span>
                  </div>

                  <div className="checkin-day-status">
                    {status === "completed" && (
                      <>
                        <span className="checkin-status-icon">
                          ✓
                        </span>
                        Completed
                      </>
                    )}

                    {status === "today" && (
                      <>
                        <span className="checkin-status-dot" />
                        Available Today
                      </>
                    )}

                    {status === "upcoming" && (
                      <>
                        <span className="checkin-lock-icon">
                          ◇
                        </span>
                        Upcoming
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="checkin-info-panel">
          <div className="checkin-info-accent" />

          <div>
            <p>HOW IT WORKS</p>
            <h3>One reward every 24 hours</h3>

            <span>
              Check in once each day. Missing a day may reset your
              streak depending on the backend check-in rules.
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}

export default CheckIn;