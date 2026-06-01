import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { useAuth } from '../../context/AuthContext';

export function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const hideFooter = 
    location.pathname.startsWith('/dashboard') || 
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/product') ||
    location.pathname.startsWith('/sell') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/signup') ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/reset-password') ||
    location.pathname.startsWith('/verify-otp') ||
    location.pathname.startsWith('/approval-pending');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className={`flex-1 pt-14 ${user ? 'pb-20' : 'pb-0'} md:pb-0`}>
        <Outlet />
      </main>
      {user && <MobileNav />}
      {!hideFooter && <Footer />}
    </div>
  );
}
