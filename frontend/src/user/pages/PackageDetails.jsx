import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

import "../styles/PackageDetails.css";

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
  bronze: "/images/packages/bronze-package.png",
  silver: "/images/packages/silver-package.png",
  gold: "/images/packages/gold-package.png",
  platinum: "/images/packages/platinum-package.png",
  diamond: "/images/packages/diamond-package.png",
};

const DEFAULT_PACKAGE_IMAGE =
  "/images/packages/platinum-package.png";

const getPackageImage = (packageName = "") => {
  const normalizedName = String(packageName).trim().toLowerCase();
  const packageType = Object.keys(PACKAGE_IMAGES).find((type) =>
    normalizedName.includes(type)
  );

  return packageType
    ? PACKAGE_IMAGES[packageType]
    : DEFAULT_PACKAGE_IMAGE;
};

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

function PackageDetails() {
  const { packageId } = useParams();
  const navigate = useNavigate();

  const [packageItem, setPackageItem] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [maxPurchases, setMaxPurchases] = useState(3);
  const [remainingPurchaseLimit, setRemainingPurchaseLimit] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const getToken = () =>
    localStorage.getItem("userToken") || localStorage.getItem("token");

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    window.setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3500);
  };

  const fetchPackageDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const response = await axios.get(
        `${API_URL}/packages/${packageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = response.data?.data || response.data || {};
      const nextPackage =
        responseData.package || responseData.packageItem || null;
      const nextRemainingLimit = Math.max(
        0,
        Number(responseData.remainingPurchaseLimit) || 0
      );

      if (!nextPackage) {
        throw new Error("Package not found");
      }

      setPackageItem(nextPackage);
      setWalletBalance(Number(responseData.balance) || 0);
      setPurchaseCount(Number(responseData.purchaseCount) || 0);
      setMaxPurchases(Number(responseData.maxPurchases) || 3);
      setRemainingPurchaseLimit(nextRemainingLimit);
      setQuantity(nextRemainingLimit > 0 ? 1 : 0);
    } catch (requestError) {
      console.error(
        "Package details error:",
        requestError.response?.data || requestError.message
      );

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Failed to load package"
      );
    } finally {
      setLoading(false);
    }
  }, [navigate, packageId]);

  useEffect(() => {
    fetchPackageDetails();
  }, [fetchPackageDetails]);

  const packageValues = useMemo(() => {
    const amount = Number(packageItem?.amount) || 0;
    const dailyReturn = Number(packageItem?.dailyReturn) || 0;
    const totalDays = Number(packageItem?.totalDays) || 0;
    const totalUnits = Math.max(1, Number(packageItem?.totalUnits) || 100);
    const soldUnits = Math.min(
      totalUnits,
      Math.max(0, Number(packageItem?.soldUnits) || 0)
    );

    return {
      amount,
      dailyReturn,
      totalDays,
      totalUnits,
      soldUnits,
      availableUnits: Math.max(0, totalUnits - soldUnits),
      totalAmount: amount * quantity,
      totalDailyReturn: dailyReturn * quantity,
      totalProfit: dailyReturn * totalDays * quantity,
    };
  }, [packageItem, quantity]);

  const maxSelectableQuantity = Math.min(
    3,
    remainingPurchaseLimit,
    packageValues.availableUnits
  );

  const hasEnoughBalance =
    walletBalance >= packageValues.totalAmount;
  const canBuy =
    quantity >= 1 &&
    quantity <= maxSelectableQuantity &&
    hasEnoughBalance &&
    !buying;

  const handleBuy = async () => {
    if (!canBuy || !packageItem) {
      return;
    }

    try {
      setBuying(true);

      const token = getToken();

      const response = await axios.post(
        `${API_URL}/packages/buy`,
        {
          packageId,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const nextPurchaseCount =
        Number(response.data?.purchaseCount) ||
        purchaseCount + quantity;
      const nextRemainingLimit =
        response.data?.remainingPurchaseLimit !== undefined
          ? Number(response.data.remainingPurchaseLimit)
          : Math.max(0, maxPurchases - nextPurchaseCount);

      setWalletBalance(
        response.data?.balance !== undefined
          ? Number(response.data.balance) || 0
          : Math.max(
              0,
              walletBalance - packageValues.totalAmount
            )
      );
      setPurchaseCount(nextPurchaseCount);
      setRemainingPurchaseLimit(nextRemainingLimit);
      setPackageItem((previous) => ({
        ...previous,
        soldUnits:
          (Number(previous?.soldUnits) || 0) + quantity,
      }));
      setQuantity(nextRemainingLimit > 0 ? 1 : 0);

      showMessage(
        `Successfully purchased ${quantity} package unit(s)`
      );
    } catch (requestError) {
      console.error(
        "Package purchase error:",
        requestError.response?.data || requestError.message
      );

      showMessage(
        requestError.response?.data?.message ||
          "Failed to purchase package",
        "error"
      );
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <main className="package-details-page">
        <div className="package-details-loading">
          <div className="package-details-spinner" />
          <p>Loading package...</p>
        </div>
      </main>
    );
  }

  if (error || !packageItem) {
    return (
      <main className="package-details-page">
        <div className="package-details-error">
          <strong>Could not open package</strong>
          <p>{error || "Package not found"}</p>
          <button type="button" onClick={() => navigate(-1)}>
            Go back
          </button>
        </div>
      </main>
    );
  }

  const packageName = packageItem.name || "Investment package";
  const limitReached = remainingPurchaseLimit === 0;
  const soldOut = packageValues.availableUnits === 0;

  return (
    <main className="package-details-page">
      <div className="package-details-container">
        <header className="package-details-header">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            ←
          </button>

          <div>
            <p>Package details</p>
            <h1>{packageName}</h1>
          </div>

          <Link to="/holdings">Holdings</Link>
        </header>

        {message && (
          <div
            className={`package-details-message ${messageType}`}
            role="alert"
          >
            {message}
          </div>
        )}

        <section className="package-details-card">
          <div className="package-details-image">
            <img
              src={getPackageImage(packageName)}
              alt={`${packageName} package`}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = DEFAULT_PACKAGE_IMAGE;
              }}
            />
          </div>

          <div className="package-details-price">
            <div>
              <span>Unit price</span>
              <strong>৳{formatMoney(packageValues.amount)}</strong>
            </div>

            <div>
              <span>Wallet</span>
              <strong>৳{formatMoney(walletBalance)}</strong>
            </div>
          </div>

          <div className="package-details-stats">
            <div>
              <span>Daily profit</span>
              <strong>
                ৳{formatMoney(packageValues.dailyReturn)}
              </strong>
            </div>
            <div>
              <span>Duration</span>
              <strong>{packageValues.totalDays} days</strong>
            </div>
            <div>
              <span>Total profit</span>
              <strong>
                ৳
                {formatMoney(
                  packageValues.dailyReturn *
                    packageValues.totalDays
                )}
              </strong>
            </div>
          </div>
        </section>

        <section className="package-purchase-card">
          <div className="package-purchase-heading">
            <div>
              <p>Select quantity</p>
              <h2>How many do you want?</h2>
            </div>

            <span>
              Purchased {purchaseCount}/{maxPurchases}
            </span>
          </div>

          <div className="package-limit-track">
            <span
              style={{
                width: `${Math.min(
                  100,
                  (purchaseCount / maxPurchases) * 100
                )}%`,
              }}
            />
          </div>

          {limitReached ? (
            <div className="package-limit-message">
              You have reached the maximum purchase limit for this
              package.
            </div>
          ) : (
            <>
              <div
                className="package-quantity-options"
                role="group"
                aria-label="Select package quantity"
              >
                {[1, 2, 3].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={
                      quantity === option ? "active" : ""
                    }
                    onClick={() => setQuantity(option)}
                    disabled={option > maxSelectableQuantity}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="package-order-summary">
                <div>
                  <span>Quantity</span>
                  <strong>{quantity}</strong>
                </div>
                <div>
                  <span>Daily profit</span>
                  <strong>
                    ৳
                    {formatMoney(
                      packageValues.totalDailyReturn
                    )}
                  </strong>
                </div>
                <div>
                  <span>Total profit</span>
                  <strong>
                    ৳{formatMoney(packageValues.totalProfit)}
                  </strong>
                </div>
                <div className="total">
                  <span>Total payment</span>
                  <strong>
                    ৳{formatMoney(packageValues.totalAmount)}
                  </strong>
                </div>
              </div>
            </>
          )}

          <button
            type="button"
            className="package-confirm-button"
            onClick={handleBuy}
            disabled={!canBuy || limitReached || soldOut}
          >
            {soldOut
              ? "Package sold out"
              : limitReached
                ? "Purchase limit reached"
                : buying
                  ? "Processing..."
                  : !hasEnoughBalance
                    ? "Insufficient balance"
                    : `Buy ${quantity} package${
                        quantity > 1 ? "s" : ""
                      }`}
          </button>

          {!hasEnoughBalance && !limitReached && (
            <Link
              to="/deposit"
              className="package-details-deposit-link"
            >
              Add ৳
              {formatMoney(
                Math.max(
                  0,
                  packageValues.totalAmount - walletBalance
                )
              )}{" "}
              to wallet
            </Link>
          )}
        </section>
      </div>
    </main>
  );
}

export default PackageDetails;
