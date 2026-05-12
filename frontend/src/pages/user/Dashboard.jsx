import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Heart, CreditCard, Settings, LogOut, MessageCircle, List, User, Search, ShoppingBag, ChevronRight, LayoutGrid } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/shared/ProductCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../utils/api';

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const { user, logout } = useAuth();
  const [categories] = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(100000);
  const searchInputRef = React.useRef(null);

  // Determine if we should show the full layout (categories/header)
  const isOverview = path === '/dashboard';
  const isChat = path.includes('/chat');
  const isProfile = path.includes('/profile');
  const isPayments = path.includes('/payments');
  const isSettings = path.includes('/settings');
  const isSearchMode = searchParams.get('searchMode') === 'true';
  const isSearching = searchQuery.length > 0 || isSearchMode;

  // Sync state with URL params
  React.useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    if (category) setActiveCategory(category);
    if (search) setSearchQuery(search);
  }, [searchParams]);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category === 'All') newParams.delete('category');
    else newParams.set('category', category);
    setSearchParams(newParams);
    navigate('/dashboard');
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutGrid },
    { name: 'Messages', path: '/dashboard/chat', icon: MessageCircle },
    { name: 'Payments', path: '/dashboard/payments', icon: CreditCard },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pt-6 md:h-[calc(100vh-56px)] md:overflow-hidden flex flex-col w-full">
      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-visible md:overflow-hidden">

        {/* Sidebar - Hidden on Messages/Payments/Settings to show full page content */}
        <aside className={`w-full lg:w-64 shrink-0 lg:overflow-y-auto pb-4 lg:pb-24 no-scrollbar ${ (isChat || isProfile || isSettings || isPayments) ? 'hidden' : 'block' }`}>
          <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-xl shadow-gray-200/40 lg:sticky lg:top-20">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 px-3">Campus Categories</h3>
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 no-scrollbar">
              <button
                onClick={() => handleCategoryClick('All')}
                className={`flex-none lg:w-full flex items-center px-4 py-2.5 lg:py-3 rounded-xl transition-all font-black text-[13px] lg:text-base tracking-tight text-left whitespace-nowrap ${activeCategory === 'All' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                  }`}
              >
                All Items
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`flex-none lg:w-full flex items-center px-4 py-2.5 lg:py-3 rounded-xl transition-all font-black text-[13px] lg:text-base tracking-tight text-left whitespace-nowrap ${activeCategory === cat.name ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 px-3 hidden lg:block">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Max Price: ₹{maxPrice}</h3>
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto pb-24 md:pb-4 pr-0 md:pr-2 no-scrollbar">
          {/* Header - Hidden on Chat/Payments/Search in Mobile */}
          <div className={`flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6 mb-6 lg:mb-4 bg-white/50 p-3 lg:p-2.5 rounded-2xl border border-gray-100/50 backdrop-blur-sm ${ (isChat || isProfile || isPayments || isSearching) ? 'hidden lg:flex' : 'flex' }`}>
            
            {/* Integrated Navigation Line */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl lg:text-2xl font-black text-gray-900 tracking-tighter whitespace-nowrap">
                  Welcome, <span className="text-primary">{user?.name?.split(' ')[0] || 'Student'}</span>!
                </h1>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">Live</span>
                </div>
              </div>

              <nav className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/50 overflow-x-auto no-scrollbar">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = path === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 lg:px-6 py-2 rounded-xl transition-all whitespace-nowrap ${isActive
                          ? 'bg-white text-primary shadow-sm font-black'
                          : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <Outlet context={{ activeCategory, searchQuery, maxPrice, isSearchMode, searchInputRef }} />
        </main>
      </div>
    </div>
  );
}

export function DashboardOverview() {
  const [products, fetchProducts, loading] = useProducts();
  const { user } = useAuth();
  const { activeCategory, searchQuery, maxPrice, isSearchMode, searchInputRef } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('relevant');
  const [localSearch, setLocalSearch] = useState(searchQuery);

  let availableProducts = products.filter(p => {
    if (p.status !== 'active') return false;
    if (activeCategory !== 'All' && p.category !== activeCategory) return false;
    if (searchQuery) {
      const match = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }
    if (p.price > maxPrice) return false;
    return true;
  });

  if (sortBy === 'price-low') {
    availableProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    availableProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'relevant') {
    availableProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const triggerSearch = (q) => {
    const newParams = new URLSearchParams(searchParams);
    if (q) newParams.set('search', q);
    else newParams.delete('search');
    setSearchParams(newParams);
  };

  if (loading && products.length === 0) {
    return <div className="text-center py-20 text-primary animate-pulse font-bold">Syncing Dashboard Data...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-50 pb-6">
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
            {searchQuery ? `Results: ${searchQuery}` : activeCategory === 'All' ? 'Campus Marketplace' : `${activeCategory} Listings`}
          </h2>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-xs font-bold text-gray-400">
              {availableProducts.length} items
            </div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-4 rounded-xl border border-gray-100 bg-gray-50 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary cursor-pointer transition-all"
            >
              <option value="relevant">Relevant</option>
              <option value="price-low">Price: Low</option>
              <option value="price-high">Price: High</option>
            </select>
          </div>
        </div>

        {availableProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {availableProducts.map(product => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-400">No products found</h3>
            <p className="text-sm text-gray-400 mt-1">Try another search or category.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function Wishlist() {
  const [products] = useProducts();
  const { user } = useAuth();

  const wishlistedProducts = products.filter(p => user?.wishlist?.includes(p._id));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">My Wishlist</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Saved for later</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
          {wishlistedProducts.length} Items Saved
        </div>
      </div>

      {wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistedProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-gray-200" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 max-w-xs mx-auto mb-8 text-sm font-bold">
            Explore the marketplace and save items you're interested in buying later.
          </p>
          <Link to="/dashboard">
            <Button className="rounded-2xl px-8 h-12 shadow-lg shadow-primary/20">Explore Dashboard</Button>
          </Link>
        </div>
      )}
    </motion.div>
  );
}

export function Payments() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment History</h1>
      <div className="bg-white dark:glass-panel rounded-2xl p-6 border border-gray-100 dark:border-white/10 shadow-sm text-center py-12 text-gray-500">
        No payment history available.
      </div>
    </motion.div>
  );
}

