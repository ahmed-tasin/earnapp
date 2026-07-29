import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import "../styles/Holdings.css";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://earnapp-n5b2.onrender.com/api";

const PACKAGE_IMAGES = {
  bronze: "/images/packages/bronze-package.png",
  silver: "/images/packages/silver-package.png",
  gold: "/images/packages/gold-package.png",
  platinum: "/images/packages/platinum-package.png",
  diamond: "/images/packages/diamond-package.png",
};

const getPackageImage = (packageName = "") => {
  const normalizedName = packageName.toLowerCase();

  const packageType = Object.keys(PACKAGE_IMAGES).find(
    (type) => normalizedName.includes(type)
  );

  return packageType
    ? PACKAGE_IMAGES[packageType]
    : PACKAGE_IMAGES.platinum;
};

const getToken = () =>
  localStorage.getItem("userToken") ||
  localStorage.getItem("token");

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatCountdown = (milliseconds) => {
  const totalSeconds = Math.max(
    Math.ceil(milliseconds / 1000),
    0
  );

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) =>
      String(part).padStart(2, "0")
    )
    .join(" : ");
};

function Holdings() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [claimingId, setClaimingId] =
    useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(Date.now());

  const fetchHoldings = useCallback(
    async (isRefresh = false) => {
      const token = getToken();

      if (!token) {
        setError(
          "Please log in to view your holdings"
        );
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

        const response = await axios.get(
          `${API_URL}/investments/holdings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const holdingsData =
          response.data?.holdings ||
          response.data?.data?.holdings ||
          [];

        setHoldings(
          Array.isArray(holdingsData)
            ? holdingsData
            : []
        );
      } catch (err) {
        console.error(
          "Holdings fetch error:",
          err.response?.data || err.message
        );

        setError(
          err.response?.data?.message ||
            "Failed to load holdings"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const totals = useMemo(() => {
    return holdings.reduce(
      (summary, holding) => {
        return {
          invested:
            summary.invested +
            Number(
              holding.investmentAmount || 0
            ),

          earned:
            summary.earned +
            Number(holding.totalEarned || 0),
        };
      },
      {
        invested: 0,
        earned: 0,
      }
    );
  }, [holdings]);

  const claimProfit = async (holdingId) => {
    const token = getToken();

    if (!token) {
      setError("Please log in again");
      return;
    }

    try {
      setClaimingId(holdingId);
      setMessage("");
      setError("");

      const response = await axios.post(
        `${API_URL}/investments/${holdingId}/claim`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data?.message ||
          "Profit claimed successfully"
      );

      await fetchHoldings(true);
    } catch (err) {
      console.error(
        "Profit claim error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Could not claim profit"
      );

      await fetchHoldings(true);
    } finally {
      setClaimingId("");
    }
  };

  if (loading) {
    return (
      <main className="holdings-page">
        <div className="holdings-loading">
          <span />
          <p>Loading holdings...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="holdings-page">
      <div className="holdings-container">
        <header className="holdings-header">
          <div>
            <p>MY INVESTMENTS</p>
            <h1>Holdings</h1>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchHoldings(true)
            }
            disabled={refreshing}
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </header>

        {message && (
          <div className="holdings-message success">
            {message}
          </div>
        )}

        {error && (
          <div className="holdings-message error">
            {error}
          </div>
        )}

        <section className="holdings-summary">
          <div>
            <span>Total invested</span>
            <strong>
              ৳{formatMoney(totals.invested)}
            </strong>
          </div>

          <div>
            <span>Total profit</span>
            <strong>
              ৳{formatMoney(totals.earned)}
            </strong>
          </div>

          <div>
            <span>Packages</span>
            <strong>{holdings.length}</strong>
          </div>
        </section>

        {holdings.length === 0 ? (
          <section className="holdings-empty">
            <div>◇</div>

            <h2>No holdings yet</h2>

            <p>
              Buy a package to start earning
              daily profit.
            </p>

            <Link to="/packages">
              View packages
            </Link>
          </section>
        ) : (
          <section className="holdings-list">
            {holdings.map((holding) => {
              const nextClaimTime =
                holding.nextClaimAt
                  ? new Date(
                      holding.nextClaimAt
                    ).getTime()
                  : 0;

              const isActive =
                holding.status === "active" &&
                Number(
                  holding.remainingDays || 0
                ) > 0;

              const canClaim =
                isActive &&
                nextClaimTime <= now;

              const packageName =
                holding.package?.name ||
                holding.packageName ||
                "Investment package";

              const totalDays =
                Number(holding.totalDays) || 0;

              const remainingDays =
                Number(
                  holding.remainingDays
                ) || 0;

              const progress =
                totalDays > 0
                  ? ((totalDays -
                      remainingDays) /
                      totalDays) *
                    100
                  : 0;

              return (
                <article
                  className="holding-card"
                  key={holding._id}
                >
                  <div className="holding-card-heading">
                    <div>
                      <p>ACTIVE HOLDING</p>
                      <h2>{packageName}</h2>
                    </div>

                    <span
                      className={`holding-status ${holding.status}`}
                    >
                      {holding.status}
                    </span>
                  </div>

                  <div className="holding-package-image">
                    <img
                      src={getPackageImage(
                        packageName
                      )}
                      alt={`${packageName} package`}
                      onError={(event) => {
                        event.currentTarget.onerror =
                          null;

                        event.currentTarget.src =
                          PACKAGE_IMAGES.platinum;
                      }}
                    />
                  </div>

                  <div className="holding-values">
                    <div>
                      <span>Invested</span>

                      <strong>
                        ৳
                        {formatMoney(
                          holding.investmentAmount
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Daily profit</span>

                      <strong className="holding-profit">
                        +৳
                        {formatMoney(
                          holding.dailyReturn
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Total earned</span>

                      <strong>
                        ৳
                        {formatMoney(
                          holding.totalEarned
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Days left</span>
                      <strong>
                        {remainingDays}
                      </strong>
                    </div>
                  </div>

                  <div className="holding-progress">
                    <span
                      style={{
                        width: `${Math.min(
                          Math.max(
                            progress,
                            0
                          ),
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  {isActive ? (
                    <>
                      <div className="holding-countdown">
                        <span>
                          {canClaim
                            ? "Your daily profit is ready"
                            : "Next profit available in"}
                        </span>

                        {!canClaim && (
                          <strong>
                            {formatCountdown(
                              nextClaimTime -
                                now
                            )}
                          </strong>
                        )}
                      </div>

                      <button
                        type="button"
                        className="holding-claim-button"
                        disabled={
                          !canClaim ||
                          claimingId ===
                            holding._id
                        }
                        onClick={() =>
                          claimProfit(
                            holding._id
                          )
                        }
                      >
                        {claimingId ===
                        holding._id
                          ? "Claiming..."
                          : canClaim
                            ? `Claim ৳${formatMoney(
                                holding.dailyReturn
                              )}`
                            : "Claim after 24 hours"}
                      </button>
                    </>
                  ) : (
                    <div className="holding-completed">
                      This package has completed
                      its earning cycle.
                    </div>
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

export default Holdings;