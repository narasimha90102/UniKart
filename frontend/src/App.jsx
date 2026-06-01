import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { ChatToast } from './components/shared/ChatToast';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { PageLoader } from './components/shared/PageLoader';

// Lazy Loaded Pages
const Home = React.lazy(() => import('./pages/main/Home').then(m => ({ default: m.Home })));
const ProductDetails = React.lazy(() => import('./pages/main/ProductDetails').then(m => ({ default: m.ProductDetails })));
const Marketplace = React.lazy(() => import('./pages/main/Marketplace').then(m => ({ default: m.Marketplace })));
const Sell = React.lazy(() => import('./pages/main/Sell').then(m => ({ default: m.Sell })));
const SellerProfile = React.lazy(() => import('./pages/main/SellerProfile').then(m => ({ default: m.SellerProfile })));
const Login = React.lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const Signup = React.lazy(() => import('./pages/auth/Signup').then(m => ({ default: m.Signup })));
const ApprovalPending = React.lazy(() => import('./pages/auth/ApprovalPending').then(m => ({ default: m.ApprovalPending })));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })));

const DashboardLayout = React.lazy(() => import('./pages/user/Dashboard').then(m => ({ default: m.DashboardLayout })));
const DashboardOverview = React.lazy(() => import('./pages/user/Dashboard').then(m => ({ default: m.DashboardOverview })));
const Wishlist = React.lazy(() => import('./pages/user/Dashboard').then(m => ({ default: m.Wishlist })));
const Payments = React.lazy(() => import('./pages/user/Dashboard').then(m => ({ default: m.Payments })));

const Settings = React.lazy(() => import('./pages/user/Settings').then(m => ({ default: m.Settings })));
const Profile = React.lazy(() => import('./pages/user/Profile').then(m => ({ default: m.Profile })));
const Orders = React.lazy(() => import('./pages/user/Orders').then(m => ({ default: m.Orders })));
const Chat = React.lazy(() => import('./pages/user/Chat').then(m => ({ default: m.Chat })));
const Notifications = React.lazy(() => import('./pages/user/Notifications').then(m => ({ default: m.Notifications })));
const Cart = React.lazy(() => import('./pages/main/Cart').then(m => ({ default: m.Cart })));
const Checkout = React.lazy(() => import('./pages/main/Checkout').then(m => ({ default: m.Checkout })));
const AdminPanel = React.lazy(() => import('./pages/admin/AdminPanel').then(m => ({ default: m.AdminPanel })));

function App() {
  return (
    <AuthProvider>
    <ThemeProvider>
      <SocketProvider>
        <NotificationProvider>
          <CartProvider>
            <BrowserRouter>
              <ChatToast />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<AppLayout />}>
                    <Route index element={<Home />} />
                    <Route path="product/:id" element={<ProductDetails />} />
                    <Route path="marketplace" element={<Marketplace />} />
                    <Route path="user/:name" element={<SellerProfile />} />
                    <Route path="sell" element={<Sell />} />
                    <Route path="login" element={<Login />} />
                    <Route path="signup" element={<Signup />} />
                    <Route path="approval-pending" element={<ApprovalPending />} />

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
              </Suspense>
            </BrowserRouter>
          </CartProvider>
        </NotificationProvider>
      </SocketProvider>
    </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
