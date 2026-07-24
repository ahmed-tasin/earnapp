import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

function UserProtectedRoute() {
  const location = useLocation();

  const token =
    localStorage.getItem("userToken") ||
    localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}

export default UserProtectedRoute;