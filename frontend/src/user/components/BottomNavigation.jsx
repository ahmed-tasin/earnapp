import React from "react";
import { NavLink } from "react-router-dom";

import "../styles/BottomNavigation.css";

function BottomNavigation() {
  const getNavClass = ({ isActive }) => {
    return isActive
      ? "bottom-nav-item active"
      : "bottom-nav-item";
  };

  return (
    <nav className="bottom-navigation">
      <NavLink
        to="/"
        end
        className={getNavClass}
      >
        <span className="bottom-nav-icon">
          🏠
        </span>

        <span className="bottom-nav-label">
          Home
        </span>
      </NavLink>

      <NavLink
        to="/team"
        className={getNavClass}
      >
        <span className="bottom-nav-icon">
          👥
        </span>

        <span className="bottom-nav-label">
          Team
        </span>
      </NavLink>

      <NavLink
        to="/wallet"
        className={getNavClass}
      >
        <span className="bottom-nav-icon">
          💰
        </span>

        <span className="bottom-nav-label">
          Wallet
        </span>
      </NavLink>

      <NavLink
        to="/profile"
        className={getNavClass}
      >
        <span className="bottom-nav-icon">
          👤
        </span>

        <span className="bottom-nav-label">
          Profile
        </span>
      </NavLink>
    </nav>
  );
}

export default BottomNavigation;