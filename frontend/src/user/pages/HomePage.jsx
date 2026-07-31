import React, { useCallback, useEffect, useState } from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";

import "../styles/HomePage.css";

import TransactionTicker from "../components/TransactionTicker";

const API_URL =
  process.env.REACT_APP_API_URL || "https://earnapp-n5b2.onrender.com/api";

const PACKAGE_IMAGES = {
  starter: "/images/packages/gtx1650.png",
  basic: "/images/packages/gtx1660.png",
  essential: "/images/packages/rtx3050.png",
  standard: "/images/packages/rtx3060.png",
  premium: "/images/packages/rtx3060ti.png",
  advanced: "/images/packages/rtx4060ti.png",
  sapphire: "/images/packages/rtx4070.png",
  titanium: "/images/packages/rtx4070ti.png",
  elite: "/images/packages/rtx4080.png",
  crown: "/images/packages/rtx4090.png",
};

const getPackageImage = (packageName = "") => {
  const normalizedName = packageName.toLowerCase();
  const packageType = Object.keys(PACKAGE_IMAGES).find((type) =>
    normalizedName.includes(type),
  );

  return packageType ? PACKAGE_IMAGES[packageType] : PACKAGE_IMAGES.platinum;
};

const defaultDashboard = {
  user: {
    name: "User",
    profilePicture: "",
  },

  wallet: {
    balance: 0,
    totalDeposit: 0,
    totalWithdraw: 0,
    totalEarning: 0,
  },

  activeInvestment: null,
  notifications: [],
};

function HomePage() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(defaultDashboard);

  const [loading, setLoading] = useState(true);

  const [homePackages, setHomePackages] = useState([]);

  const [currentTime, setCurrentTime] = useState(Date.now());

  const [message, setMessage] = useState("");

  const getToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("userToken");
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  }, [navigate]);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      const response = await axios.get(`${API_URL}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData =
        response.data?.dashboard ||
        response.data?.data?.dashboard ||
        response.data?.data ||
        {};

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

      setDashboard({
        user: {
          name:
            responseData.user?.name ||
            responseData.name ||
            storedUser.name ||
            responseData.user?.username ||
            responseData.username ||
            storedUser.username ||
            "User",

          profilePicture:
            responseData.user?.profilePicture ||
            responseData.profilePicture ||
            "",
        },

        wallet: {
          balance: responseData.wallet?.balance ?? responseData.balance ?? 0,

          totalDeposit:
            responseData.wallet?.totalDeposit ?? responseData.totalDeposit ?? 0,

          totalWithdraw:
            responseData.wallet?.totalWithdraw ??
            responseData.totalWithdraw ??
            0,

          totalEarning:
            responseData.wallet?.totalEarning ?? responseData.totalEarning ?? 0,
        },

        activeInvestment:
          responseData.activeInvestment || responseData.investment || null,

        notifications: responseData.notifications || [],
      });
    } catch (error) {
      console.error(
        "Dashboard load error:",
        error.response?.data || error.message,
      );

      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
        return;
      }

      setMessage(error.response?.data?.message || "Dashboard data load failed");
    } finally {
      setLoading(false);
    }
  }, [handleLogout, navigate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const response = await axios.get(`${API_URL}/packages`);

        const responseData = response.data;
        const packageList = Array.isArray(responseData)
          ? responseData
          : responseData?.packages ||
            responseData?.data?.packages ||
            responseData?.data ||
            [];

        setHomePackages(
          (Array.isArray(packageList) ? packageList : [])
            .filter(
              (item) =>
                String(item.status || "active").toLowerCase() === "active",
            )
            .slice(0, 5),
        );
      } catch (error) {
        console.error(
          "Home packages load error:",
          error.response?.data || error.message,
        );
      }
    };

    loadPackages();
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString("en-BD");
  };

  const getPackageCountdown = (packageItem) => {
    const endTime = packageItem.saleEndsAt
      ? new Date(packageItem.saleEndsAt).getTime()
      : new Date(packageItem.createdAt).getTime() +
        (Number(packageItem.totalDays) || 0) * 86400000;

    const totalSeconds = Math.floor(Math.max(0, endTime - currentTime) / 1000);

    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  };

  const getPackageProgress = (packageItem) => {
    const totalUnits = Math.max(1, Number(packageItem.totalUnits) || 100);
    const soldUnits = Math.min(
      totalUnits,
      Math.max(0, Number(packageItem.soldUnits) || 0),
    );

    return {
      totalUnits,
      soldUnits,
      percentage: Math.round((soldUnits / totalUnits) * 100),
    };
  };

  if (loading) {
    return (
      <div className="user-page-loading">
        <div className="user-loading-spinner" />

        <p>Dashboard loading...</p>
      </div>
    );
  }

  const siteStartTime = new Date("2026-07-27T00:00:00+06:00").getTime();

  const totalSeconds = Math.floor(
    Math.max(0, currentTime - siteStartTime) / 1000,
  );

  const siteRunningTime = {
    days: Math.floor(totalSeconds / 86400),

    hours: Math.floor((totalSeconds % 86400) / 3600),

    minutes: Math.floor((totalSeconds % 3600) / 60),

    seconds: totalSeconds % 60,
  };

  return (
    <div className="user-home-page">
      <section className="home-hero-banner">
        <img src="/images/home/home-banner.png" alt="Nvidia Finance" />
      </section>

      <section className="site-running-timer">
        <h2>সাইট নিরাপদে চলছে</h2>

        <div className="site-running-timer-grid">
          {[
            ["Day", siteRunningTime.days],
            ["Hour", siteRunningTime.hours],
            ["Minute", siteRunningTime.minutes],
            ["Second", siteRunningTime.seconds],
          ].map(([label, value]) => (
            <div key={label}>
              <strong>{String(value).padStart(2, "0")}</strong>

              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="home-shortcuts">
        <button type="button" onClick={() => navigate("/deposit")}>
          <span>＋</span>
          <small>Deposit</small>
        </button>

        <button type="button" onClick={() => navigate("/withdraw")}>
          <span>↗</span>
          <small>Withdraw</small>
        </button>

        <button type="button" onClick={() => navigate("/team")}>
          <span>🔗</span>
          <small>Invite</small>
        </button>

        <button type="button" onClick={() => navigate("/checkin")}>
          <span>✓</span>
          <small>Check In</small>
        </button>
      </div>

      {message && <div className="user-home-message">{message}</div>}

      <TransactionTicker />

      {/*  <section className="home-section quick-actions-section">
        <div className="home-section-heading">
          <div>
            <h2>Quick Actions</h2>

            <p>
              Access important features
            </p>
          </div>
        </div>

        <div className="quick-action-grid">
          <button
            type="button"
            onClick={() =>
              navigate("/packages")
            }
          >
            <span>📦</span>
            <small>Packages</small>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/team")
            }
          >
            <span>👥</span>
            <small>My Team</small>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/team")
            }
          >
            <span>🔗</span>
            <small>Referral</small>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
          >
            <span>👤</span>
            <small>Profile</small>
          </button>
        </div>
      </section> */}

      {homePackages.length > 0 && (
        <section className="home-section">
          <div className="home-section-heading">
            <div>
              <h2>Investment Packages</h2>
              <p>Scroll to explore available packages</p>
            </div>

            <button type="button" onClick={() => navigate("/packages")}>
              View all
            </button>
          </div>

          <div className="home-packages-list">
            {homePackages.map((packageItem, index) => {
              const packageId = packageItem._id || packageItem.id || index;
              const name = packageItem.name || `Package ${index + 1}`;
              const amount = Number(packageItem.amount) || 0;
              const dailyReturn = Number(packageItem.dailyReturn) || 0;
              const totalDays = Number(packageItem.totalDays) || 0;
              const totalProfit = dailyReturn * totalDays;
              const countdown = getPackageCountdown(packageItem);
              const progress = getPackageProgress(packageItem);

              return (
                <article key={packageId} className="home-package-card">
                  <h3>{name}</h3>

                  <div className="home-package-image">
                    <img src={getPackageImage(name)} alt={`${name} package`} />
                  </div>

                  <div className="home-package-countdown">
                    {[
                      ["Day", countdown.days],
                      ["Hour", countdown.hours],
                      ["Minute", countdown.minutes],
                      ["Second", countdown.seconds],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <strong>{String(value).padStart(2, "0")}</strong>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="home-package-progress-copy">
                    <span>{progress.percentage}% purchased</span>
                    <strong>
                      {progress.soldUnits}/{progress.totalUnits} units
                    </strong>
                  </div>

                  <div className="home-package-progress">
                    <span
                      style={{
                        width: `${progress.percentage}%`,
                      }}
                    />
                  </div>

                  <div className="home-package-metrics">
                    <div>
                      <strong>৳{formatMoney(amount)}</strong>
                      <span>Unit Price</span>
                    </div>

                    <div>
                      <strong>৳{formatMoney(dailyReturn)}</strong>
                      <span>Daily Profit</span>
                    </div>

                    <div>
                      <strong>৳{formatMoney(totalProfit)}</strong>
                      <span>Total Profit</span>
                    </div>

                    <div>
                      <strong>
                        {Math.max(0, progress.totalUnits - progress.soldUnits)}
                      </strong>
                      <span>Units Left</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="home-package-buy"
                    onClick={() => navigate("/packages")}
                  >
                    Buy Now
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <div className="bottom-navigation-space" />
    </div>
  );
}

export default HomePage;
