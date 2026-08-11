import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import "../styles/ReferralList.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://earnapp-n5b2.onrender.com/api";

const LEVEL_INFO = {
  1: { rate: "10%", color: "level-one" },
  2: { rate: "5%", color: "level-two" },
  3: { rate: "3%", color: "level-three" },
};

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6M9 12h12" />
    </svg>
  );
}

const maskMemberInfo = (value) => {
  const rawValue = String(value || "").trim();
  const digits = rawValue.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("01")) {
    return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
  }

  return rawValue ? `@${rawValue}` : "@user";
};

function ReferralList() {
  const navigate = useNavigate();
  const { level: levelParam } = useParams();
  const level = Number(levelParam);
  const levelInfo = LEVEL_INFO[level];

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");

      if (!token) throw new Error("Please login to view your referrals");

      const response = await axios.get(`${API_URL}/referral/info`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data?.data || response.data || {};
      const referralLevels = data.referralLevels || {};
      const levelKey = `level${level}`;

      setMembers(
        Array.isArray(referralLevels[levelKey])
          ? referralLevels[levelKey]
          : level === 1 && Array.isArray(data.directReferrals)
            ? data.directReferrals
            : [],
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load referral list",
      );
    } finally {
      setLoading(false);
    }
  }, [level]);

  useEffect(() => {
    if (!levelInfo) {
      navigate("/team", { replace: true });
      return;
    }

    fetchMembers();
  }, [fetchMembers, levelInfo, navigate]);

  if (!levelInfo) return null;

  return (
    <main className="referral-list-page">
      <div className="referral-list-container">
        <header className="referral-list-header">
          <button
            type="button"
            className="referral-list-back"
            onClick={() => navigate("/team")}
            aria-label="Back to team"
          >
            <BackIcon />
          </button>

          <div>
            <p>Your referral network</p>
            <h1>Level {level} members</h1>
          </div>

          <span aria-hidden="true" />
        </header>

        <section className={`referral-list-summary ${levelInfo.color}`}>
          <span>Level {level} commission</span>
          <strong>{levelInfo.rate}</strong>
          <p>{members.length} total members</p>
        </section>

        {loading ? (
          <div className="referral-list-state">Loading members...</div>
        ) : error ? (
          <div className="referral-list-state is-error">
            <p>{error}</p>
            <button type="button" onClick={fetchMembers}>
              Retry
            </button>
          </div>
        ) : members.length ? (
          <section className="referral-members">
            {members.map((member) => (
              <article className="referral-member" key={member._id}>
                <span className="referral-member-avatar">
                  {(member.name || member.username || "U")
                    .charAt(0)
                    .toUpperCase()}
                </span>

                <div>
                  <strong>{member.name || member.username || "Member"}</strong>
                  <span>{maskMemberInfo(member.phone || member.username)}</span>
                </div>

                <small
                  className={
                    String(member.status || "active").toLowerCase() === "active"
                      ? "is-active"
                      : ""
                  }
                >
                  {member.status || "active"}
                </small>
              </article>
            ))}
          </section>
        ) : (
          <div className="referral-list-state">
            No members in Level {level} yet.
          </div>
        )}
      </div>
    </main>
  );
}

export default ReferralList;