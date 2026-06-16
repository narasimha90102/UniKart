import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Heart, CreditCard, Settings, LogOut, MessageCircle, List, User, Search, ShoppingBag, ChevronRight, LayoutGrid, SlidersHorizontal, ArrowUpRight, ArrowDownLeft, TrendingUp, Clock } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { useNotifications } from '../../context/NotificationContext';
import { ProductCard } from '../../components/shared/ProductCard';
import { ProductSkeleton } from '../../components/shared/ProductSkeleton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../utils/api';

export function DashboardLayout() {
  const location = useLocation();
  const path = location.pathname;
  const { user } = useAuth();
  const [categories] = useCategories();
  const [products] = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(100000);
  const searchInputRef = React.useRef(null);
  const { totalUnreadMessages } = useNotifications();

  // Sync state with URL params
  React.useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    if (category) setActiveCategory(category);
    else setActiveCategory('All');
    if (search) setSearchQuery(search);
    else setSearchQuery('');
  }, [searchParams]);

  const activeProductsCount = products.filter(p => p.status === 'active').length;

  const showHeader = 
    location.pathname === '/dashboard' || 
    location.pathname.includes('/chat') || 
    location.pathname.includes('/payments');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full min-h-[calc(100vh-64px)] flex flex-col gap-6">
      {/* Welcome header with inline nav tabs */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
              Welcome, <span className="text-primary">{user?.name?.split(' ')[0] || 'Narasimha'}</span>!
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {activeProductsCount} {activeProductsCount === 1 ? 'item' : 'items'} available from your campus
            </p>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200/50 overflow-x-auto no-scrollbar shrink-0">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 lg:px-5 py-1.5 rounded-lg transition-all whitespace-nowrap text-[11px] font-black uppercase tracking-widest ${
                location.pathname === '/dashboard'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Overview
            </Link>
            <Link
              to="/dashboard/chat"
              className={`flex items-center gap-2 px-4 lg:px-5 py-1.5 rounded-lg transition-all whitespace-nowrap text-[11px] font-black uppercase tracking-widest relative ${
                location.pathname.includes('/chat')
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Messages
              {totalUnreadMessages > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[18px] text-center">
                  {totalUnreadMessages}
                </span>
              )}
            </Link>
            <Link
              to="/dashboard/payments"
              className={`flex items-center gap-2 px-4 lg:px-5 py-1.5 rounded-lg transition-all whitespace-nowrap text-[11px] font-black uppercase tracking-widest ${
                location.pathname.includes('/payments')
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Payments
            </Link>
          </nav>
        </div>
      )}

      <div className="flex-1">
        <Outlet context={{ activeCategory, searchQuery, maxPrice, searchInputRef }} />
      </div>
    </div>
  );
}

export function DashboardOverview() {
  const [products, fetchProducts, loading] = useProducts();
  const { user } = useAuth();
  const [categories] = useCategories();
  const location = useLocation();
  const { activeCategory, searchQuery, maxPrice, isSearchMode, searchInputRef } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('relevant');
  const [soldProducts, setSoldProducts] = useState([]);

  useEffect(() => {
    const fetchSoldProducts = async () => {
      try {
        const res = await api.get('/products?status=sold');
        const items = res.data.data || [];
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        const freshSold = items.filter(p => new Date(p.updatedAt || p.createdAt) >= fiveDaysAgo);
        setSoldProducts(freshSold);
      } catch (err) {
        console.error('[DashboardOverview] Failed to fetch sold products:', err);
      }
    };
    fetchSoldProducts();
  }, []);

  let availableProducts = products.filter(p => {
    if (p.status !== 'active') return false;
    if (activeCategory !== 'All' && p.category !== activeCategory) return false;
    if (searchQuery) {
      const match = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  if (sortBy === 'price-low') {
    availableProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    availableProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'relevant') {
    availableProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const handleCategoryClick = (category) => {
    const newParams = new URLSearchParams(searchParams);
    if (category === 'All') newParams.delete('category');
    else newParams.set('category', category);
    setSearchParams(newParams);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Categories, Sorting & Sell Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-2 border-b border-gray-100 pb-4">
        {/* Horizontal Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 shrink-0 max-w-full lg:max-w-[70%]">
          <button
            onClick={() => handleCategoryClick('All')}
            className={`px-3.5 py-1 rounded-full border text-[14px] font-semibold transition-all whitespace-nowrap ${
              activeCategory === 'All'
                ? 'bg-primary text-white border-transparent'
                : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className={`px-3.5 py-1 rounded-full border text-[14px] font-semibold transition-all whitespace-nowrap ${
                activeCategory === cat.name
                  ? 'bg-primary text-white border-transparent'
                  : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort select & Sell button wrapper */}
        <div className="flex items-center gap-3 self-end lg:self-auto shrink-0">
          {/* Sort Select */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-250 rounded-lg px-2.5 py-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-[14px] font-semibold outline-none cursor-pointer bg-transparent text-gray-700 pr-1"
            >
              <option value="relevant">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Sell Button */}
          <Link to="/sell">
            <Button className="bg-primary text-white hover:bg-primary/95 font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-[12px] active:scale-95 transition-all">
              <span className="text-base font-normal">+</span> Sell something
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid of Product Cards */}
      {loading && availableProducts.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <ProductSkeleton key={idx} />
          ))}
        </div>
      ) : availableProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {availableProducts.map(product => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-150">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-400">No products found</h3>
          <p className="text-sm text-gray-400 mt-1">Try another category or search query.</p>
        </div>
      )}
      {/* Recently Sold */}
      {soldProducts.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-gray-100">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">Recently Sold</h2>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mt-1">Completed campus deals</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {soldProducts.slice(0, 10).map(product => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        </div>
      )}
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
  const [payments, setPayments] = useState({ purchases: [], sales: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sent'); // 'sent' or 'received'

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/orders/my-payments');
        if (res.data && res.data.success) {
          setPayments(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // Compute stats
  const totalSent = payments.purchases
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.price, 0);

  const totalReceived = payments.sales
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.price, 0);

  const pendingSent = payments.purchases
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.price, 0);

  const pendingReceived = payments.sales
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.price, 0);

  const currentList = activeTab === 'sent' ? payments.purchases : payments.sales;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="h-32 bg-gray-200 rounded-3xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-250 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8 pb-20"
    >
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Payments Dashboard</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
            Manage and track your campus cash flow
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metric: Total Sent */}
        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-[#1B8C50]/20 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-black text-gray-450 uppercase tracking-widest">Total Spent</p>
              <h3 className="text-3xl font-black text-gray-900 mt-2">₹{totalSent}</h3>
              {pendingSent > 0 && (
                <p className="text-xs font-bold text-orange-555 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> ₹{pendingSent} pending
                </p>
              )}
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-100" />
        </div>

        {/* Metric: Total Received */}
        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-[#1B8C50]/20 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-black text-gray-455 uppercase tracking-widest">Total Earnings</p>
              <h3 className="text-3xl font-black text-gray-900 mt-2">₹{totalReceived}</h3>
              {pendingReceived > 0 && (
                <p className="text-xs font-bold text-orange-555 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> ₹{pendingReceived} pending
                </p>
              )}
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-100" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 pb-px">
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-2 pb-4 px-2 text-sm font-black uppercase tracking-wider border-b-2 transition-all relative ${
            activeTab === 'sent'
              ? 'border-[#1B8C50] text-[#1B8C50]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          Sent Payments ({payments.purchases.length})
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`flex items-center gap-2 pb-4 px-2 ml-8 text-sm font-black uppercase tracking-wider border-b-2 transition-all relative ${
            activeTab === 'received'
              ? 'border-[#1B8C50] text-[#1B8C50]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          Received Payments ({payments.sales.length})
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {currentList.length > 0 ? (
          currentList.map(pay => {
            const partnerName = activeTab === 'sent' ? (pay.seller?.name || 'Campus Seller') : (pay.user?.name || 'Campus Buyer');
            const partnerEmail = activeTab === 'sent' ? pay.seller?.email : pay.user?.email;
            const payMethodMapped = pay.paymentMethod === 'gpay' ? 'Google Pay' : 
                                    pay.paymentMethod === 'phonepe' ? 'PhonePe' : 
                                    pay.paymentMethod === 'paytm' ? 'Paytm' : 
                                    pay.paymentMethod === 'cash' ? 'Cash on Meetup' : (pay.paymentMethod || 'Campus Meetup');

            return (
              <div 
                key={pay._id} 
                className="bg-white rounded-[2rem] p-5 border border-gray-100 hover:border-primary/20 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  {/* Product Thumbnail */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                    <img 
                      src={pay.product?.images?.[0] || 'https://via.placeholder.com/150'} 
                      alt={pay.product?.title || 'Deleted Item'} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    />
                  </div>

                  <div>
                    <h4 className="font-black text-gray-900 text-[15px] truncate max-w-[200px] sm:max-w-[300px]">
                      {pay.product?.title || 'Unknown Campus Item'}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 font-semibold flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>{activeTab === 'sent' ? 'Paid to' : 'Received from'}:</span>
                      <span className="text-primary font-black uppercase tracking-tight">{partnerName}</span>
                      {partnerEmail && <span className="text-gray-400 font-normal">({partnerEmail})</span>}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">
                      {new Date(pay.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {new Date(pay.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col justify-between sm:items-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                  <div className="text-left sm:text-right">
                    <p className="text-xl font-black text-gray-900">₹{pay.price}</p>
                    <p className="text-[10px] text-gray-450 font-bold uppercase tracking-widest mt-0.5">
                      via {payMethodMapped}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    pay.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                    pay.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      pay.status === 'completed' ? 'bg-emerald-500' : 
                      pay.status === 'pending' ? 'bg-orange-500 animate-pulse' : 'bg-red-500'
                    }`} />
                    {pay.status}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No transaction history yet</h3>
            <p className="text-gray-500 max-w-xs mx-auto mb-8 text-sm font-bold">
              {activeTab === 'sent' 
                ? "You haven't purchased any products on campus yet." 
                : "You haven't sold any products on campus yet."}
            </p>
            <Link to="/dashboard">
              <Button className="rounded-2xl px-8 h-12 shadow-lg shadow-primary/20">
                Explore Marketplace
              </Button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}

