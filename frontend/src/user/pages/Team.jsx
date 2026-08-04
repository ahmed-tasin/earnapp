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

function Icon({ name }) {
  const icons = {
    back: <path d="m15 18-6-6 6-6M9 12h12" />,
    copy: (
      <>
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0 2 2h3" />
      </>
    ),
    share: (
      <path d="M18 8a3 3 0 1 0-2.83-4A3 3 0 0 0 15.17 6L8.83 9.17a3 3 0 1 0 0 5.66L15.17 18a3 3 0 1 0 1 1.78l-6.34-3.17a3 3 0 0 0 0-1.22l6.34-3.17A3 3 0 0 0 18 8Z" />
    ),
    earn: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M15 9.5c-.4-.9-1.45-1.5-3-1.5-1.75 0-3 .9-3 2.2 0 3.3 6 1.5 6 4.3 0 1.3-1.2 2.2-3 2.2-1.55 0-2.6-.6-3-1.5M12 6.5v11" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 7a3 3 0 0 1 0 5.7M18.5 20a5.4 5.4 0 0 0-3.2-4.9" />
      </>
    ),
    active: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="m8.5 12 2.2 2.2 4.8-4.8" />
      </>
    ),
    direct: (
      <>
        <path d="M4 18V9M10 18V5M16 18v-7M22 18V3" />
        <path d="M2 21h21" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    close: <path d="m7 7 10 10M17 7 7 17" />,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {icons[name]}
    </svg>
  );
}

function Team() {
  const navigate = useNavigate();

  const [teamData, setTeamData] = useState({
    referralCode: "",
    referralLink: "",
    directReferrals: [],
    referralLevels: { 1: [], 2: [], 3: [] },
    totalTeam: 0,
    totalCommission: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");


  const getToken = () =>
    localStorage.getItem("userToken") || localStorage.getItem("token");

  const fetchTeam = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Please login to view your team");
      }

      const response = await axios.get(`${API_URL}/referral/info`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data?.data || response.data || {};
      const referrals =
        data.directReferrals || data.referrals || data.team || [];

      const referralLevels = data.referralLevels || {};

      const levelOne = Array.isArray(referralLevels.level1)
        ? referralLevels.level1
        : Array.isArray(referrals)
          ? referrals
          : [];

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
        directReferrals: levelOne,
        referralLevels: {
          1: levelOne,
          2: Array.isArray(referralLevels.level2)
            ? referralLevels.level2
            : [],
          3: Array.isArray(referralLevels.level3)
            ? referralLevels.level3
            : [],
        },
        totalTeam:
          data.totalTeam ?? data.totalReferrals ?? levelOne.length ?? 0,
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

  const showCopyMessage = (text) => {
    setCopyMessage(text);
    window.setTimeout(() => setCopyMessage(""), 1800);
  };

  const copyText = async (text, label) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      showCopyMessage(`${label} copied`);
    } catch {
      showCopyMessage("Could not copy");
    }
  };

  const shareInvite = async () => {
    if (!teamData.referralLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my team",
          text: `Use my referral code: ${teamData.referralCode}`,
          url: teamData.referralLink,
        });

        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }

    copyText(teamData.referralLink, "Referral link");
  };

  const levels = [
    {
      level: 1,
      rate: "10%",
      users: teamData.referralLevels[1].length,
      commission: teamData.totalCommission,
    },
    {
      level: 2,
      rate: "5%",
      users: teamData.referralLevels[2].length,
      commission: 0,
    },
    {
      level: 3,
      rate: "3%",
      users: teamData.referralLevels[3].length,
      commission: 0,
    },
  ];

  const stats = [
    {
      label: "Referral earned",
      value: `৳${formatAmount(teamData.totalCommission)}`,
      icon: "earn",
    },
    {
      label: "Total members",
      value: String(teamData.totalTeam).padStart(2, "0"),
      icon: "users",
    },
    {
      label: "Active members",
      value: String(activeMembers).padStart(2, "0"),
      icon: "active",
    },
    {
      label: "Direct referrals",
      value: String(teamData.directReferrals.length).padStart(2, "0"),
      icon: "direct",
    },
  ];

  if (loading) {
    return (
      <main className="team-page">
        <div className="team-loading">
          <div className="team-spinner" />
          <p>Loading invite details...</p>
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
            <Icon name="back" />
          </button>

          <div>
            <p>Referral program</p>
            <h1>Invite & Earn</h1>
          </div>

          <span className="team-header-spacer" aria-hidden="true" />
        </header>

        {copyMessage && (
          <div className="team-copy-message">{copyMessage}</div>
        )}

        {error && (
          <div className="team-error" role="alert">
            <div>
              <strong>Could not load invite details</strong>
              <p>{error}</p>
            </div>

            <button type="button" onClick={fetchTeam}>
              Retry
            </button>
          </div>
        )}

        <section className="team-invite-hero">
          <div className="team-hero-mark">✦</div>

          <p>Invite friends</p>

          <h2>
            Grow together.
            <br />
            Earn together.
          </h2>

          <span>
            Share your code and get commission when your friends join.
          </span>

          <div className="team-code-box">
            <div>
              <small>Your referral code</small>
              <strong>{teamData.referralCode || "Not available"}</strong>
            </div>

            <button
              type="button"
              onClick={() => copyText(teamData.referralCode, "Referral code")}
              disabled={!teamData.referralCode}
              aria-label="Copy referral code"
            >
              <Icon name="copy" />
            </button>
          </div>

          <div className="team-link-box">
            <div>
              <small>Your referral link</small>
              <span>{teamData.referralLink || "Not available"}</span>
            </div>

            <button
              type="button"
              onClick={() => copyText(teamData.referralLink, "Referral link")}
              disabled={!teamData.referralLink}
              aria-label="Copy full referral link"
            >
              <Icon name="copy" />
            </button>
          </div>

          <div className="team-invite-actions">
            <button
              type="button"
              className="team-primary-button"
              onClick={shareInvite}
              disabled={!teamData.referralLink}
            >
              <Icon name="share" />
              Share invite
            </button>

            <button
              type="button"
              className="team-secondary-button"
              onClick={() => copyText(teamData.referralLink, "Referral link")}
              disabled={!teamData.referralLink}
            >
              <Icon name="copy" />
              Copy link
            </button>
          </div>
        </section>

        <section className="team-overview" aria-label="Referral statistics">
          {stats.map((stat) => (
            <article className="team-stat" key={stat.label}>
              <span className="team-stat-icon">
                <Icon name={stat.icon} />
              </span>

              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </section>

        <section className="team-levels-section">
          <div className="team-section-heading">
            <div>
              <p>Your earning structure</p>
              <h2>Commission levels</h2>
            </div>

            <span>Up to 10%</span>
          </div>

          <div className="team-level-list">
            {levels.map((item) => (
              <button
                type="button"
                className="level-card"
                key={item.level}
                onClick={() => navigate(`/team/level/${item.level}`)}
                aria-label={`Show Level ${item.level} referral list`}
              >
                <span className={`level-badge level-${item.level}`}>
                  {item.level}
                </span>

                <div className="level-title">
                  <h3>Level {item.level}</h3>
                  <span>{item.rate} commission</span>
                </div>

                <div className="level-summary">
                  <span>{item.users} users</span>
                  <strong>৳{formatAmount(item.commission)}</strong>
                </div>

                <Icon name="arrow" />
              </button>
            ))}
          </div>
        </section>


      </div>
    </main>
  );
}

export default Team;