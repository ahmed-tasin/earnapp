import React from "react";

import {
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import UserProtectedRoute from "./components/UserProtectedRoute";
import BottomNavigation from "./components/BottomNavigation";

import UserLogin from "./pages/UserLogin";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import Wallet from "./pages/Wallet";
import Packages from "./pages/Packages";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Transactions from "./pages/Transactions";
import Team from "./pages/Team";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

function UserLayout() {
  return (
    <>
      <Outlet />
      <BottomNavigation />
    </>
  );
}

function UserApp() {
  return (
    <Routes>
      <Route
        path="login"
        element={<UserLogin />}
      />

      <Route
        path="register"
        element={<Register />}
      />

      <Route element={<UserProtectedRoute />}>
        <Route element={<UserLayout />}>
          <Route
            index
            element={<HomePage />}
          />

          <Route
            path="home"
            element={<HomePage />}
          />

          <Route
            path="wallet"
            element={<Wallet />}
          />

          <Route
            path="packages"
            element={<Packages />}
          />

          <Route
            path="deposit"
            element={<Deposit />}
          />

          <Route
            path="withdraw"
            element={<Withdraw />}
          />

          <Route
            path="transactions"
            element={<Transactions />}
          />

          <Route
            path="team"
            element={<Team />}
          />

          <Route
            path="notifications"
            element={<Notifications />}
          />

          <Route
            path="profile"
            element={<Profile />}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

export default UserApp;