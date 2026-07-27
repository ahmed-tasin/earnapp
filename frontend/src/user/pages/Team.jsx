import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import "../styles/Team.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://earnapp-n5b2.onrender.com/api";

function Team() {
  const [teamData, setTeamData] = useState({
    referralCode: "",
    referralLink: "",
    directReferrals: [],
    totalTeam: 0,
    totalCommission: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const fetchTeam = useCallback(async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = localStorage.getItem("userToken");

      if (!token) {
        throw new Error("Please login to view your team");
      }

      const response = await axios.get(`${API_URL}/referral/info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      /*
        Supported response formats:

        {
          success: true,
          referralCode: "",
          referralLink: "",
          directReferrals: [],
          totalTeam: 0,
          totalCommission: 0
        }

        {
          success: true,
          data: {
            referralCode: "",
            referrals: []
          }
        }
      */

      const data = response.data?.data || response.data || {};

      const referrals =
        data.directReferrals || data.referrals || data.team || [];

      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

      const referralCode =
        data.referralCode ||
        data.user?.referralCode ||
        savedUser.referralCode ||
        "";

      const referralLink = referralCode
        ? `${window.location.origin}/register?ref=${encodeURIComponent(
            referralCode,
          )}`
        : "";

      setTeamData({
        referralCode,
        referralLink,
        directReferrals: Array.isArray(referrals) ? referrals : [],
        totalTeam:
          data.totalTeam ?? data.totalReferrals ?? referrals.length ?? 0,
        totalCommission:
          data.totalCommission ??
          data.referralCommissionEarned ??
          data.user?.referralCommissionEarned ??
          0,
      });
    } catch (error) {
      console.error("Team fetch error:", error.response?.data || error.message);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load team information",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const activeMembers = useMemo(() => {
    return teamData.directReferrals.filter((member) => {
      return String(member.status || "active").toLowerCase() === "active";
    }).length;
  }, [teamData.directReferrals]);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Unknown date";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return new Intl.DateTimeFormat("en-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopyMessage(`${label} copied`);

      setTimeout(() => {
        setCopyMessage("");
      }, 1800);
    } catch {
      setCopyMessage("Could not copy");

      setTimeout(() => {
        setCopyMessage("");
      }, 1800);
    }
  };

  const shareReferral = async () => {
    const shareText = `Join using my referral code: ${teamData.referralCode}`;
    const shareUrl = teamData.referralLink;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join EarnApp",
          text: shareText,
          url: shareUrl,
        });
      } else {
        await copyText(shareUrl, "Referral link");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        setCopyMessage("Unable to share");
      }
    }
  };

  if (loading) {
    return (
      <main className="team-page">
        <div className="team-container">
          <div className="team-loading">
            <div className="team-spinner" />
            <p>Loading your team...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="team-page">
      <div className="team-container">
        <header className="team-header">
          <div>
            <p className="team-header-label">Referral network</p>
            <h1>My Team</h1>
          </div>

          <button
            type="button"
            className="team-refresh-button"
            onClick={() => fetchTeam(true)}
            disabled={refreshing}
          >
            <span
              className={
                refreshing ? "team-refresh-icon rotating" : "team-refresh-icon"
              }
            >
              ↻
            </span>

            <span>{refreshing ? "Refreshing" : "Refresh"}</span>
          </button>
        </header>

        {copyMessage && <div className="team-copy-message">{copyMessage}</div>}

        {error && (
          <div className="team-error" role="alert">
            <div>
              <strong>Could not load team</strong>
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() => fetchTeam(true)}
              disabled={refreshing}
            >
              Retry
            </button>
          </div>
        )}

        <section className="team-referral-card">
          <div className="team-referral-content">
            <p>Your Referral Code</p>

            <div className="team-referral-code-row">
              <h2>{teamData.referralCode || "Not available"}</h2>

              <button
                type="button"
                onClick={() => copyText(teamData.referralCode, "Referral code")}
                disabled={!teamData.referralCode}
              >
                Copy
              </button>
            </div>

            <div className="team-referral-link">
              <span>{teamData.referralLink}</span>

              <button
                type="button"
                onClick={() => copyText(teamData.referralLink, "Referral link")}
                disabled={!teamData.referralLink}
              >
                Copy Link
              </button>
            </div>

            <button
              type="button"
              className="team-share-button"
              onClick={shareReferral}
              disabled={!teamData.referralCode}
            >
              Share Referral Link
            </button>
          </div>

          <div className="team-referral-icon">👥</div>
        </section>

        <section className="team-summary-grid">
          <article className="team-summary-card">
            <div className="team-summary-icon">👤</div>

            <div>
              <p>Direct Referrals</p>
              <h3>{teamData.directReferrals.length}</h3>
            </div>
          </article>

          <article className="team-summary-card">
            <div className="team-summary-icon">🌐</div>

            <div>
              <p>Total Team</p>
              <h3>{teamData.totalTeam}</h3>
            </div>
          </article>

          <article className="team-summary-card">
            <div className="team-summary-icon">✓</div>

            <div>
              <p>Active Members</p>
              <h3>{activeMembers}</h3>
            </div>
          </article>

          <article className="team-summary-card">
            <div className="team-summary-icon">৳</div>

            <div>
              <p>Referral Income</p>
              <h3>৳{formatAmount(teamData.totalCommission)}</h3>
            </div>
          </article>
        </section>

        <section className="team-members-section">
          <div className="team-section-heading">
            <div>
              <p>Your network</p>
              <h2>Direct Referrals</h2>
            </div>

            <span>{teamData.directReferrals.length} members</span>
          </div>

          {teamData.directReferrals.length === 0 ? (
            <div className="team-empty-state">
              <div className="team-empty-icon">👥</div>

              <h3>No team members yet</h3>

              <p>
                Share your referral link and invite people to join your team.
              </p>

              <button
                type="button"
                onClick={shareReferral}
                disabled={!teamData.referralCode}
              >
                Invite Members
              </button>
            </div>
          ) : (
            <div className="team-members-list">
              {teamData.directReferrals.map((member, index) => {
                const memberId = member._id || member.id || `member-${index}`;

                const memberName = member.name || member.username || "User";

                const memberStatus = String(
                  member.status || "active",
                ).toLowerCase();

                return (
                  <article key={memberId} className="team-member-card">
                    <div className="team-member-avatar">
                      {memberName.charAt(0).toUpperCase()}
                    </div>

                    <div className="team-member-info">
                      <div className="team-member-title-row">
                        <h3>{memberName}</h3>

                        <span
                          className={`team-member-status status-${memberStatus}`}
                        >
                          {memberStatus}
                        </span>
                      </div>

                      <p>{member.phone || "Contact not available"}</p>

                      <span>
                        Joined {formatDate(member.createdAt || member.joinedAt)}
                      </span>
                    </div>

                    <div className="team-member-earning">
                      <span>Commission</span>

                      <strong>
                        ৳
                        {formatAmount(
                          member.commission || member.referralCommission || 0,
                        )}
                      </strong>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="team-info-card">
          <div>💡</div>

          <p>
            Invite real users only. Referral rewards should be credited
            according to your platform rules and approved transactions.
          </p>
        </section>
      </div>
    </main>
  );
}

export default Team;
