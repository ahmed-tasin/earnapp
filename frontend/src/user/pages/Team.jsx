import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Team.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://earnapp-n5b2.onrender.com/api";

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

function Team() {
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState({
    referralCode: "",
    referralLink: "",
    directReferrals: [],
    totalTeam: 0,
    totalCommission: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const fetchTeam = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("Please login to view your team");

      const response = await axios.get(`${API_URL}/referral/info`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data?.data || response.data || {};
      const referrals =
        data.directReferrals || data.referrals || data.team || [];
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const referralCode =
        data.referralCode ||
        data.user?.referralCode ||
        savedUser.referralCode ||
        "";

      setTeamData({
        referralCode,
        referralLink: referralCode
          ? `${window.location.origin}/register?ref=${encodeURIComponent(
              referralCode,
            )}`
          : "",
        directReferrals: Array.isArray(referrals) ? referrals : [],
        totalTeam:
          data.totalTeam ?? data.totalReferrals ?? referrals.length ?? 0,
        totalCommission:
          data.totalCommission ??
          data.referralCommissionEarned ??
          data.user?.referralCommissionEarned ??
          0,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load team information",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const activeMembers = useMemo(
    () =>
      teamData.directReferrals.filter(
        (member) =>
          String(member.status || "active").toLowerCase() === "active",
      ).length,
    [teamData.directReferrals],
  );

  const copyText = async (text, label) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage(`${label} copied`);
    } catch {
      setCopyMessage("Could not copy");
    }

    window.setTimeout(() => setCopyMessage(""), 1800);
  };

  const levels = [
    {
      level: 1,
      rate: "10%",
      users: teamData.directReferrals.length,
      commission: teamData.totalCommission,
    },
    { level: 2, rate: "5%", users: 0, commission: 0 },
    { level: 3, rate: "3%", users: 0, commission: 0 },
  ];

  if (loading) {
    return (
      <main className="team-page">
        <div className="team-loading">
          <div className="team-spinner" />
          <p>Loading your team...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="team-page">
      <div className="team-container">
        <header className="team-header">
          <button
            type="button"
            className="team-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            ←
          </button>
          <h1>My Team</h1>
          <button
            type="button"
            className="team-icon-button team-help-button"
            aria-label="Help"
          >
            ?
          </button>
        </header>

        <div className="team-content">
          {copyMessage && (
            <div className="team-copy-message">{copyMessage}</div>
          )}

          {error && (
            <div className="team-error" role="alert">
              <div>
                <strong>Could not load team</strong>
                <p>{error}</p>
              </div>
              <button type="button" onClick={fetchTeam}>
                Retry
              </button>
            </div>
          )}

          <section className="team-overview">
            <article className="team-stat">
              <div className="team-stat-icon">৳</div>
              <p>Total Earn</p>
              <strong>৳{formatAmount(teamData.totalCommission)}</strong>
            </article>
            <article className="team-stat">
              <div className="team-stat-icon">♟</div>
              <p>Total Members</p>
              <strong>{String(teamData.totalTeam).padStart(2, "0")}</strong>
            </article>
            <article className="team-stat">
              <div className="team-stat-icon">
                <span className="active-dot" />
                ♙
              </div>
              <p>Active Members</p>
              <strong>{String(activeMembers).padStart(2, "0")}</strong>
            </article>
            <article className="team-stat">
              <div className="team-stat-icon">↗</div>
              <p>Direct Referrals</p>
              <strong>
                {String(teamData.directReferrals.length).padStart(2, "0")}
              </strong>
            </article>
          </section>

          <section className="team-card referral-card">
            <h2>Share Referral Link</h2>

            <div className="referral-field">
              <div className="referral-value">
                <span>Referral Code</span>
                <strong>{teamData.referralCode || "Not available"}</strong>
              </div>
              <button
                type="button"
                className="copy-button"
                onClick={() =>
                  copyText(teamData.referralCode, "Referral code")
                }
                disabled={!teamData.referralCode}
              >
                <span className="copy-symbol">▢</span> Copy
              </button>
            </div>

            <div className="referral-field">
              <div className="referral-value">
                <span>Referral Link</span>
                <a href={teamData.referralLink}>
                  {teamData.referralLink || "Not available"}
                </a>
              </div>
              <button
                type="button"
                className="copy-button"
                onClick={() =>
                  copyText(teamData.referralLink, "Referral link")
                }
                disabled={!teamData.referralLink}
              >
                <span className="copy-symbol">▢</span> Copy
              </button>
            </div>
          </section>

          {levels.map((item) => (
            <section className="team-card level-card" key={item.level}>
              <div className="level-header">
                <div className={`level-badge level-${item.level}`}>
                  <span>♙</span>
                  <small>{item.level}</small>
                </div>

                <div className="level-title">
                  <h3>Level {item.level}</h3>
                  <span>{item.rate}</span>
                </div>

                <button type="button" className="directory-button">
                  Directory <b>›</b>
                </button>
              </div>

              <div className="level-details">
                <div className="level-detail">
                  <div className="detail-icon">♙</div>
                  <div>
                    <span>Users</span>
                    <strong>{String(item.users).padStart(2, "0")}</strong>
                  </div>
                </div>

                <div className="level-detail">
                  <div className="detail-icon">৳</div>
                  <div>
                    <span>Commission</span>
                    <strong>৳{formatAmount(item.commission)}</strong>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Team;
