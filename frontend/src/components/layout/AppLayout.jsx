import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';

export function AppLayout() {
  const location = useLocation();
  const isDashboardOrAdmin = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-14 pb-20 md:pb-0">
        <Outlet />
      </main>
      <MobileNav />
      {!isDashboardOrAdmin && <Footer />}
    </div>
  );
}
