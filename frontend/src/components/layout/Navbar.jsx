import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Search, Menu, Bell, User, MessageCircle, X, Settings, LogOut, Package, LayoutGrid, Shield, CheckCircle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationDropdown } from './NotificationDropdown';

export function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { totalUnreadMessages, unreadNotificationsCount } = useNotifications();
  const { t } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationTriggerRef = useRef(null);
  const isSignup = location.pathname === '/signup';
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/verify-otp', '/reset-password', '/approval-pending'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  // Hide search bar on inner pages — dashboard sub-routes, cart, sell, checkout
  const isNoSearchPage =
    location.pathname.startsWith('/dashboard/') ||
    ['/cart', '/sell', '/checkout'].some(p => location.pathname.startsWith(p));

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/dashboard?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isAuthPage ? 'bg-transparent border-transparent' : 'bg-white border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Left: Logo + Admin Dashboard pill */}
          <div className="flex items-center gap-3">
            {user && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-gray-600"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-1">
              <img src="/logo.png" alt="UniKart" className="h-16 w-auto object-contain" />
            </Link>

            {/* Admin Dashboard — desktop pill */}
            {user?.role === 'admin' && !isAuthPage && (
              <Link
                to="/admin/dashboard"
                className="hidden md:inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1B8C50] text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-[#1B8C50]/30 hover:bg-[#157040] transition-all"
              >
                <Shield className="w-4.5 h-4.5" />
                Admin Dashboard
              </Link>
            )}

            {/* Admin Dashboard — mobile icon button */}
            {user?.role === 'admin' && !isAuthPage && (
              <Link
                to="/admin/dashboard"
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-[#1B8C50] text-white shadow-md hover:bg-[#157040] transition-all"
                title="Admin Dashboard"
              >
                <Shield className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Mobile Search Bar */}
          {!isAuthPage && !isAdminPage && !isNoSearchPage && (
            <div className="flex-1 md:hidden mx-2 relative max-w-[140px] xs:max-w-[170px] sm:max-w-[210px] transition-all">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/90" />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder').toUpperCase()} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full pl-8 pr-3 py-1.5 h-8 rounded-full bg-[#1B8C50] text-white placeholder-emerald-100/70 focus:bg-[#157040] focus:placeholder-white outline-none text-[9px] border border-[#167040]/30 shadow-[0_4px_12px_rgba(27,140,80,0.2)] transition-all font-black uppercase tracking-widest"
              />
            </div>
          )}

          {!isAuthPage && !isAdminPage && !isNoSearchPage && (
            <div className="flex-1 max-w-2xl px-8 hidden md:block">
              {/* ... (keep existing search input) ... */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1B8C50] transition-colors" />
                <Input 
                  type="text" 
                  placeholder={t('searchBooks')} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  className="pl-12 w-full rounded-lg bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:border-[#1B8C50] focus:ring-4 focus:ring-[#1B8C50]/10 transition-all h-11 text-sm shadow-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <div className="relative">
                  <Button 
                    ref={notificationTriggerRef}
                    variant="ghost" 
                    size="icon" 
                    className="relative hidden sm:flex text-gray-600"
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </Button>
                  <NotificationDropdown 
                    isOpen={isNotificationOpen} 
                    onClose={() => setIsNotificationOpen(false)} 
                    triggerRef={notificationTriggerRef}
                  />
                </div>
                <Link to="/dashboard/wishlist">
                  <Button variant="ghost" size="icon" className="hidden sm:flex text-gray-600">
                    <Heart className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/cart">
                  <Button variant="ghost" size="icon" className="text-gray-600 relative">
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
                
                <div className="relative group hidden sm:block ml-2">
                  {/* ... (keep existing desktop profile dropdown) ... */}
                  <Link to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}>
                    <div className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors border border-gray-200 min-w-0">
                      {user.avatar && user.avatar !== 'default-avatar.png' && !avatarError ? (
                        <img 
                          src={user.avatar} 
                          alt="User" 
                          className="w-7 h-7 rounded-full object-cover shrink-0" 
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <div className="default-avatar w-7 h-7 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs uppercase select-none shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-semibold text-gray-700 max-w-[120px] truncate block" title={user.role === 'admin' ? 'Admin' : user.name}>
                        {user.role === 'admin' ? 'Admin' : user.name}
                      </span>
                      {user.role !== 'admin' && (
                        user.isVerified ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" title="Verified Campus Account" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5 text-orange-500 shrink-0 animate-pulse" title="Verify Campus Account" />
                        )
                      )}
                    </div>
                  </Link>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link to="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{t('myProfile')}</Link>
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{t('overview')}</Link>
                    <Link to="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{t('accountSettings')}</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">{t('signOut')}</button>
                    <div className="my-1 border-t border-gray-100"></div>
                    <Link to="/sell" className="block px-4 py-2 text-sm text-[#1B8C50] font-medium hover:bg-green-50">{t('sellProducts')}</Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link to="/login">
                  <Button 
                    variant={location.pathname !== '/signup' ? 'default' : 'ghost'} 
                    className={`rounded-lg px-4 sm:px-6 font-semibold transition-all ${location.pathname !== '/signup' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-600 hover:text-primary'}`}
                  >
                    {t('login')}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button 
                    variant={location.pathname === '/signup' ? 'default' : 'ghost'} 
                    className={`rounded-lg px-4 sm:px-6 font-semibold transition-all ${location.pathname === '/signup' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-600 hover:text-primary'}`}
                  >
                    {t('signUp')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[70] md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <img src="/logo.png" alt="UniKart" className="h-12 w-auto object-contain" />
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {user && (
                  <>
                    <div className="px-2 mb-6">
                      <div className="flex items-center gap-3 p-3 bg-[#1B8C50]/5 rounded-2xl border border-[#1B8C50]/10">
                        {/* Avatar — always a perfect circle */}
                        <div className="w-11 h-11 rounded-full shrink-0 overflow-hidden ring-2 ring-[#1B8C50]/20">
                          {user.avatar && user.avatar !== 'default-avatar.png' && !avatarError ? (
                            <img 
                              src={user.avatar} 
                              alt="User" 
                              className="w-full h-full object-cover" 
                              onError={() => setAvatarError(true)}
                            />
                          ) : (
                            <div className="default-avatar w-full h-full bg-[#1B8C50] text-white font-black flex items-center justify-center text-base uppercase select-none">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-gray-900 text-sm truncate flex items-center gap-1">
                            {user.name}
                            {user.role !== 'admin' && (
                              user.isVerified ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              ) : (
                                <ShieldAlert className="w-3.5 h-3.5 text-orange-500 shrink-0 animate-pulse" />
                              )
                            )}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                      <LayoutGrid className="w-5 h-5" /> {t('overview')}
                    </Link>
                    <Link to="/dashboard/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                      <User className="w-5 h-5" /> {t('myProfile')}
                    </Link>
                    <Link to="/dashboard/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                      <Heart className="w-5 h-5" /> {t('wishlist')}
                    </Link>
                    <Link to="/dashboard/chat" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                      <MessageCircle className="w-5 h-5" /> {t('messages')}
                    </Link>
                    <Link to="/dashboard/notifications" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium relative">
                      <Bell className="w-5 h-5" /> {t('notifications')}
                      {unreadNotificationsCount > 0 && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                          {unreadNotificationsCount}
                        </span>
                      )}
                    </Link>
                    <Link to="/dashboard/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                      <Settings className="w-5 h-5" /> {t('settings')}
                    </Link>
                    <div className="my-4 border-t border-gray-100" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-medium">
                      <LogOut className="w-5 h-5" /> {t('signOut')}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
