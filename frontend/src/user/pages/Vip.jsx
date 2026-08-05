import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "../styles/Vip.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://earnapp-n5b2.onrender.com/api";

const VIP_LEVELS = [
  { level: 1, referrals: 0, title: "Starter" },
  { level: 2, referrals: 3, title: "Builder" },
  { level: 3, referrals: 10, title: "Leader" },
  { level: 4, referrals: 25, title: "Elite" },
  { level: 5, referrals: 50, title: "Premier" },
];

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6M9 12h12" />
    </svg>
  );
}

function Vip() {
  const navigate = useNavigate();

  const [referrals, setReferrals] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVipInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login to view VIP levels");
      }

      const response = await axios.get(`${API_URL}/referral/info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data?.data || response.data || {};

      const directReferrals = Array.isArray(data.directReferrals)
        ? data.directReferrals.length
        : Number(data.totalReferrals || 0);

      setReferrals(directReferrals);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Failed to load VIP information",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVipInfo();
  }, [loadVipInfo]);

  const currentVip = useMemo(
    () =>
      VIP_LEVELS.reduce(
        (current, vip) =>
          referrals >= vip.referrals ? vip : current,
        VIP_LEVELS[0],
      ),
    [referrals],
  );

  const nextVip = VIP_LEVELS.find(
    (vip) => vip.level > currentVip.level,
  );

  const referralsNeeded = nextVip
    ? Math.max(0, nextVip.referrals - referrals)
    : 0;

  const progress = nextVip
    ? Math.min(
        100,
        ((referrals - currentVip.referrals) /
          Math.max(1, nextVip.referrals - currentVip.referrals)) *
          100,
      )
    : 100;

  return (
    <main className="vip-page">
      <div className="vip-container">
        <header className="vip-header">
          <button
            type="button"
            className="vip-back-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <BackIcon />
          </button>

          <div>
            <p>Membership program</p>
            <h1>VIP Levels</h1>
          </div>

          <span aria-hidden="true" />
        </header>

        {loading ? (
          <div className="vip-state">Loading VIP information...</div>
        ) : (
          <>
            <section className="vip-hero">
              <div className="vip-crown">♛</div>

              <p>Your current level</p>
              <h2>VIP {currentVip.level}</h2>
              <strong>{currentVip.title}</strong>
              <span>Referral achievement level</span>

              <div className="vip-referral-count">
                <b>{referrals}</b>
                <small>Direct referrals</small>
              </div>
            </section>

            {error ? (
              <div className="vip-error">
                <p>{error}</p>

                <button type="button" onClick={loadVipInfo}>
                  Retry
                </button>
              </div>
            ) : (
              <section className="vip-progress-card">
                {nextVip ? (
                  <>
                    <div className="vip-progress-heading">
                      <div>
                        <small>Next level</small>
                        <strong>
                          VIP {nextVip.level} · {nextVip.title}
                        </strong>
                      </div>

                      <b>{referralsNeeded} more</b>
                    </div>

                    <div className="vip-progress-track">
                      <span style={{ width: `${progress}%` }} />
                    </div>

                    <p>
                      Invite {referralsNeeded} more direct referral
                      {referralsNeeded === 1 ? "" : "s"} to unlock VIP{" "}
                      {nextVip.level}.
                    </p>
                  </>
                ) : (
                  <p className="vip-max-message">
                    You have reached the highest VIP level.
                  </p>
                )}
              </section>
            )}

            <section className="vip-levels-section">
              <div className="vip-section-heading">
                <p>Referral requirements</p>
                <h2>Choose your target</h2>
              </div>

              <div className="vip-level-list">
                {VIP_LEVELS.map((vip) => {
                  const unlocked = referrals >= vip.referrals;
                  const isCurrent = vip.level === currentVip.level;

                  return (
                    <article
                      className={`vip-level-card ${
                        unlocked ? "unlocked" : "locked"
                      } ${isCurrent ? "current" : ""}`}
                      key={vip.level}
                    >
                      <span className="vip-level-number">{vip.level}</span>

                      <div className="vip-level-copy">
                        <div>
                          <h3>VIP {vip.level}</h3>
                          {isCurrent && <em>Current</em>}
                        </div>

                        <span>{vip.title}</span>
                      </div>

                      <div className="vip-level-reward">
                        <strong>{unlocked ? "Unlocked" : "Locked"}</strong>
                        <span>
                          {vip.referrals} referral
                          {vip.referrals === 1 ? "" : "s"}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default Vip;