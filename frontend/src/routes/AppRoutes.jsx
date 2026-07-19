import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// User Pages
import HomeTab from '../components/HomeTab';
import TeamTab from '../components/TeamTab';
import WalletTab from '../components/WalletTab';
import ProfileTab from '../components/ProfileTab';
import { LoginPage, RegisterPage } from '../components/AuthPages';

// Admin Pages
import AdminLogin from '../admin/AdminLogin';
import AdminApp from '../admin/AdminApp';

// Protected Route Component
const ProtectedAdminRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

export default function AppRoutes({ currentUser, setCurrentUser, logout }) {
  const isAdminAuthenticated = !!localStorage.getItem('adminToken');

  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedAdminRoute isAuthenticated={isAdminAuthenticated}>
            <AdminApp onLogout={() => {
              localStorage.removeItem('adminToken');
              window.location.href = '/admin/login';
            }} />
          </ProtectedAdminRoute>
        }
      />

      {/* User Auth Routes */}
      {!currentUser ? (
        <>
          <Route path="/login" element={<LoginPage setCurrentUser={setCurrentUser} />} />
          <Route path="/register" element={<RegisterPage setCurrentUser={setCurrentUser} />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          {/* User App Routes */}
          <Route path="/" element={<HomeTab user={currentUser} setUser={setCurrentUser} />} />
          <Route path="/team" element={<TeamTab user={currentUser} />} />
          <Route path="/wallet" element={<WalletTab user={currentUser} setUser={setCurrentUser} />} />
          <Route path="/profile" element={<ProfileTab user={currentUser} logout={logout} />} />
        </>
      )}

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}