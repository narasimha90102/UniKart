import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Handle case where user is logged in but not approved (e.g. status was changed while logged in)
  if (user.status !== 'approved' && user.role !== 'admin') {
    return <Navigate to="/login" state={{ error: 'Account pending approval or suspended.' }} replace />;
  }

  return <Outlet />;
}
