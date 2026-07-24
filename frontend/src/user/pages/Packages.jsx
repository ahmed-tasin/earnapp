import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import "../styles/Packages.css";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function Packages() {
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [buyingPackageId, setBuyingPackageId] = useState("");

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

  const normalizePackages = (responseData) => {
    const packageList =
      responseData?.packages ||
      responseData?.data?.packages ||
      responseData?.data ||
      [];

    return Array.isArray(packageList) ? packageList : [];
  };

  const fetchPackages = useCallback(async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = getToken();

      const requests = [
        axios.get(`${API_URL}/packages`, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }),
      ];

      if (token) {
        requests.push(
          axios.get(`${API_URL}/wallet`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        );
      }

      const responses = await Promise.allSettled(requests);

      const packagesResponse = responses[0];

      if (packagesResponse.status === "rejected") {
        throw packagesResponse.reason;
      }

      setPackages(normalizePackages(packagesResponse.value.data));

      const walletResponse = responses[1];

      if (walletResponse?.status === "fulfilled") {
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
        "Packages fetch error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load investment packages"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const activePackages = useMemo(() => {
    return packages.filter((item) => {
      const status = String(item.status || "active").toLowerCase();

      return status === "active";
    });
  }, [packages]);

  const formatMoney = (amount) => {
    const numericAmount = Number(amount) || 0;

    return new Intl.NumberFormat("en-BD", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  };

  const calculateTotalReturn = (packageItem) => {
    const amount = Number(packageItem.amount) || 0;
    const dailyReturn = Number(packageItem.dailyReturn) || 0;
    const totalDays = Number(packageItem.totalDays) || 0;

    /*
      This assumes dailyReturn is a fixed money amount.

      Example:
      amount = 1000
      dailyReturn = 50
      totalDays = 30

      Total profit = 50 × 30 = 1500
      Total return = 1000 + 1500 = 2500
    */

    return amount + dailyReturn * totalDays;
  };

  const calculateTotalProfit = (packageItem) => {
    const dailyReturn = Number(packageItem.dailyReturn) || 0;
    const totalDays = Number(packageItem.totalDays) || 0;

    return dailyReturn * totalDays;
  };

  const handleBuyPackage = async (packageItem) => {
    const packageId = packageItem._id || packageItem.id;
    const packageAmount = Number(packageItem.amount) || 0;

    if (!packageId) {
      showMessage("Invalid package ID", "error");
      return;
    }

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    if (walletBalance < packageAmount) {
      showMessage(
        "Insufficient wallet balance. Please deposit first.",
        "error"
      );
      return;
    }

    const confirmed = window.confirm(
      `Buy ${packageItem.name || "this package"} for ৳${formatMoney(
        packageAmount
      )}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setBuyingPackageId(packageId);

      const response = await axios.post(
        `${API_URL}/investments/buy`,
        {
          packageId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedBalance =
        response.data?.wallet?.balance ??
        response.data?.data?.wallet?.balance ??
        response.data?.balance;

      if (updatedBalance !== undefined) {
        setWalletBalance(Number(updatedBalance) || 0);
      } else {
        setWalletBalance((previousBalance) =>
          Math.max(0, previousBalance - packageAmount)
        );
      }

      showMessage(
        response.data?.message ||
          "Investment package purchased successfully"
      );
    } catch (err) {
      console.error(
        "Package purchase error:",
        err.response?.data || err.message
      );

      showMessage(
        err.response?.data?.message ||
          "Failed to purchase package",
        "error"
      );
    } finally {
      setBuyingPackageId("");
    }
  };

  if (loading) {
    return (
      <main className="packages-page">
        <div className="packages-loading">
          <div className="packages-spinner" />
          <p>Loading investment packages...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="packages-page">
      <div className="packages-container">
        <header className="packages-header">
          <div>
            <p className="packages-header-label">
              Investment plans
            </p>

            <h1>Packages</h1>
          </div>

          <button
            type="button"
            className="packages-refresh-button"
            onClick={() => fetchPackages(true)}
            disabled={refreshing}
          >
            <span
              className={
                refreshing
                  ? "packages-refresh-icon rotating"
                  : "packages-refresh-icon"
              }
            >
              ↻
            </span>

            {refreshing ? "Refreshing" : "Refresh"}
          </button>
        </header>

        {message && (
          <div
            className={`packages-message ${messageType}`}
            role="alert"
          >
            {message}
          </div>
        )}

        {error && (
          <div className="packages-error" role="alert">
            <div>
              <strong>Could not load packages</strong>
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() => fetchPackages(true)}
              disabled={refreshing}
            >
              Retry
            </button>
          </div>
        )}

        <section className="packages-wallet-card">
          <div>
            <span>Available Wallet Balance</span>

            <h2>৳{formatMoney(walletBalance)}</h2>

            <p>
              Your package amount will be deducted from this balance.
            </p>
          </div>

          <Link to="/deposit" className="packages-deposit-link">
            Add Balance
          </Link>
        </section>

        <section className="packages-intro">
          <div>
            <p>Choose your plan</p>
            <h2>Available Investment Packages</h2>
          </div>

          <span>{activePackages.length} packages</span>
        </section>

        {activePackages.length === 0 ? (
          <section className="packages-empty">
            <div className="packages-empty-icon">📦</div>

            <h2>No Packages Available</h2>

            <p>
              There are currently no active investment packages.
              Please check again later.
            </p>

            <button
              type="button"
              onClick={() => fetchPackages(true)}
              disabled={refreshing}
            >
              Check Again
            </button>
          </section>
        ) : (
          <section className="packages-grid">
            {activePackages.map((packageItem, index) => {
              const packageId =
                packageItem._id || packageItem.id || index;

              const name =
                packageItem.name || `Package ${index + 1}`;

              const amount = Number(packageItem.amount) || 0;
              const dailyReturn =
                Number(packageItem.dailyReturn) || 0;
              const totalDays =
                Number(packageItem.totalDays) || 0;

              const totalProfit =
                calculateTotalProfit(packageItem);

              const totalReturn =
                calculateTotalReturn(packageItem);

              const canAfford = walletBalance >= amount;
              const isBuying = buyingPackageId === packageId;

              return (
                <article
                  key={packageId}
                  className={
                    index === 1
                      ? "package-card featured"
                      : "package-card"
                  }
                >
                  {index === 1 && (
                    <span className="package-featured-badge">
                      Popular
                    </span>
                  )}

                  <div className="package-card-header">
                    <div className="package-icon">৳</div>

                    <div>
                      <p>Investment package</p>
                      <h3>{name}</h3>
                    </div>
                  </div>

                  <div className="package-price">
                    <span>Package Price</span>

                    <h2>৳{formatMoney(amount)}</h2>
                  </div>

                  {packageItem.description && (
                    <p className="package-description">
                      {packageItem.description}
                    </p>
                  )}

                  <div className="package-benefits">
                    <div className="package-benefit-row">
                      <span>Daily Return</span>
                      <strong>
                        ৳{formatMoney(dailyReturn)}
                      </strong>
                    </div>

                    <div className="package-benefit-row">
                      <span>Package Duration</span>
                      <strong>{totalDays} days</strong>
                    </div>

                    <div className="package-benefit-row">
                      <span>Total Profit</span>
                      <strong>
                        ৳{formatMoney(totalProfit)}
                      </strong>
                    </div>

                    <div className="package-benefit-row total">
                      <span>Expected Total Return</span>
                      <strong>
                        ৳{formatMoney(totalReturn)}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={
                      canAfford
                        ? "package-buy-button"
                        : "package-buy-button insufficient"
                    }
                    onClick={() =>
                      handleBuyPackage(packageItem)
                    }
                    disabled={isBuying}
                  >
                    {isBuying
                      ? "Processing..."
                      : canAfford
                        ? "Buy Package"
                        : "Insufficient Balance"}
                  </button>

                  {!canAfford && (
                    <Link
                      to="/deposit"
                      className="package-add-balance-link"
                    >
                      Deposit ৳
                      {formatMoney(
                        Math.max(0, amount - walletBalance)
                      )}{" "}
                      more
                    </Link>
                  )}
                </article>
              );
            })}
          </section>
        )}

        <section className="packages-info-card">
          <div className="packages-info-icon">ℹ️</div>

          <div>
            <h3>Investment Information</h3>

            <p>
              Review the package amount, daily return and duration
              carefully before purchasing. Once purchased, the
              investment amount may not be refundable.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Packages;