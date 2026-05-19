import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { Home } from './pages/main/Home';
import { ProductDetails } from './pages/main/ProductDetails';
import { Sell } from './pages/main/Sell';
import { SellerProfile } from './pages/main/SellerProfile';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';

import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { DashboardLayout, DashboardOverview, Wishlist, Payments } from './pages/user/Dashboard';
import { Settings } from './pages/user/Settings';
import { Profile } from './pages/user/Profile';
import { Orders } from './pages/user/Orders';
import { Chat } from './pages/user/Chat';
import { Notifications } from './pages/user/Notifications';
import { Cart } from './pages/main/Cart';
import { Checkout } from './pages/main/Checkout';
import { AdminPanel } from './pages/admin/AdminPanel';
import { ChatToast } from './components/shared/ChatToast';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <CartProvider>
            <BrowserRouter>
              <ChatToast />
              <Routes>
                {/* ... existing routes ... */}
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Home />} />
                  <Route path="product/:id" element={<ProductDetails />} />
                  <Route path="user/:name" element={<SellerProfile />} />
                  <Route path="sell" element={<Sell />} />
                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />

                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password/:token" element={<ResetPassword />} />
                  
                  {/* Protected User Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout/:id" element={<Checkout />} />
                    <Route path="dashboard" element={<DashboardLayout />}>
                      <Route index element={<DashboardOverview />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="chat" element={<Chat />} />
                      <Route path="notifications" element={<Notifications />} />
                      <Route path="wishlist" element={<Wishlist />} />
                      <Route path="payments" element={<Payments />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                  </Route>
                  
                  {/* Protected Admin Routes */}
                  <Route element={<AdminRoute />}>
                    <Route path="admin/dashboard" element={<AdminPanel />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
