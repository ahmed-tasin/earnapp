import React from "react";
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Deposits from "./pages/Deposits";
import Withdraws from "./pages/Withdraws";
import Users from "./pages/Users";
import Packages from "./pages/Packages";
import Investments from "./pages/Investments";

import ProtectedRoute from "./components/ProtectedRoute";

import "./admin.css";

function AdminApp() {
  const token = localStorage.getItem("adminToken");

  return (
    <Routes>
      <Route
        path="login"
        element={
          token
            ? <Navigate to="/admin/dashboard" replace />
            : <AdminLogin />
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="deposits" element={<Deposits />} />
        <Route path="withdraws" element={<Withdraws />} />
        <Route path="users" element={<Users />} />
        <Route path="packages" element={<Packages />} />
        <Route path="investments" element={<Investments />} />
      </Route>

      <Route
        index
        element={
          <Navigate
            to={token ? "dashboard" : "login"}
            replace
          />
        }
      />

      <Route
  path="investments"
  element={<Investments />}
/>

      <Route
        path="*"
        element={
          <Navigate
            to={token ? "/admin/dashboard" : "/admin/login"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default AdminApp;