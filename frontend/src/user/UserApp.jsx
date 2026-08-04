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
import PackageDetails from "./pages/PackageDetails";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Transactions from "./pages/Transactions";
import Team from "./pages/Team";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import CheckIn from "./pages/CheckIn";
import Holdings from "./pages/Holdings";
import Card from "./pages/card";
import ReferralList from "./pages/ReferralList";

function UserLayout() {
  return (
    <div className="user-layout">
      <main className="user-layout-content">
        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  );
}

function UserApp() {
  return (
    <Routes>
      <Route path="login" element={<UserLogin />} />
      <Route path="register" element={<Register />} />

      <Route element={<UserProtectedRoute />}>
        <Route element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="packages" element={<Packages />} />
          <Route
            path="packages/:packageId"
            element={<PackageDetails />}
          />
          <Route path="wallet" element={<Wallet />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="withdraw" element={<Withdraw />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="team" element={<Team />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="checkin" element={<CheckIn />} />
          <Route path="holdings" element={<Holdings />} />
          <Route path="card" element={<Card />} />
          <Route path="team/level/:level" element={<ReferralList />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default UserApp;
