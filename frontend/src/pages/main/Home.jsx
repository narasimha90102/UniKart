import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Zap, Users, TrendingUp, Star, Lock, Camera, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ProductCard } from '../../components/shared/ProductCard';
import { ProductSkeleton } from '../../components/shared/ProductSkeleton';
import { useCategories } from '../../hooks/useCategories';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import api from '../../utils/api';

export function Home() {
  const [categories] = useCategories();
  const [products, , loading] = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [soldProducts, setSoldProducts] = React.useState([]);

  React.useEffect(() => {
    const fetchSoldProducts = async () => {
      try {
        const res = await api.get('/products?status=sold');
        const items = res.data.data || [];
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        const freshSold = items.filter(p => new Date(p.updatedAt || p.createdAt) >= fiveDaysAgo);
        setSoldProducts(freshSold);
      } catch (err) {
        console.error('[Home] Failed to fetch sold products:', err);
      }
    };
    fetchSoldProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  React.useEffect(() => {
    if (user && window.innerWidth < 768) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="pt-16 lg:pt-20 bg-[#f5fbf7]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-4 pb-12 lg:pt-6 lg:pb-16 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Left Content */}
            <div className="flex-1 lg:max-w-3xl xl:max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B8C50]/10 text-[#1B8C50] text-sm font-semibold mb-6">
                  <span>🎓 Campus-Only Marketplace</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] xl:text-[62px] font-extrabold text-[#1a1a1a] leading-[1.1] tracking-tight mb-6">
                  Buy & Sell Within{' '}
                  <span className="text-[#1B8C50] border-b-[6px] border-[#1B8C50] pb-1 inline-block">Your Campus</span>
                </h1>

                <p className="text-base lg:text-lg text-gray-600 mb-8 max-w-xl leading-relaxed">
                  UniKart connects verified university students for safe, trusted second-hand product exchange. No strangers — just your campus community.
                </p>

                {/* Big Search Bar */}
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="What are you looking for?"
                      className="w-full h-14 pl-12 pr-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:border-[#1B8C50] focus:ring-4 focus:ring-[#1B8C50]/10 outline-none transition-all text-gray-900"
                    />
                  </div>
                  <Button type="submit" className="h-14 px-8 text-base font-semibold rounded-xl bg-[#1B8C50] hover:bg-[#157040] shadow-md shadow-[#1B8C50]/20">
                    Search
                  </Button>
                </form>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-4">
                  {[
                    { label: '📚 Books', value: 'Books' },
                    { label: '💻 Electronics', value: 'Electronics' },
                    { label: '🎮 Gadgets', value: 'Gadgets' },
                    { label: '⚽ Sports', value: 'Sports' }
                  ].map(cat => (
                    <Link key={cat.label} to={`/dashboard?category=${cat.value}`} className="px-5 py-2.5 bg-white border border-gray-100 shadow-sm rounded-full text-sm font-medium text-gray-700 cursor-pointer hover:border-primary hover:text-primary transition-colors">
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Content / Floating Cards */}
            <div className="flex-1 relative hidden lg:block h-[350px]">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="absolute top-4 left-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 flex items-center gap-3 max-w-xs"
              >
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-[#1B8C50]" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">100% Verified</h4>
                  <p className="text-xs text-gray-500">University students only</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="absolute bottom-10 right-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 flex items-center gap-3 max-w-xs"
              >
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Quick Deals</h4>
                  <p className="text-xs text-gray-500">Within campus only</p>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-[#1B8C50] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div className="space-y-2">
              <Users className="w-8 h-8 mx-auto text-green-100" strokeWidth={1.5} />
              <h3 className="text-4xl font-bold">500+</h3>
              <p className="text-green-100 text-sm">Active Students</p>
            </div>
            <div className="space-y-2">
              <TrendingUp className="w-8 h-8 mx-auto text-green-100" strokeWidth={1.5} />
              <h3 className="text-4xl font-bold">8+</h3>
              <p className="text-green-100 text-sm">Products Listed</p>
            </div>
            <div className="space-y-2">
              <Star className="w-8 h-8 mx-auto text-green-100" strokeWidth={1.5} />
              <h3 className="text-4xl font-bold">4.8</h3>
              <p className="text-green-100 text-sm">Avg. Rating</p>
            </div>
            <div className="space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-green-100" strokeWidth={1.5} />
              <h3 className="text-4xl font-bold">100%</h3>
              <p className="text-green-100 text-sm">Verified Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
            <Link to="/dashboard" className="text-sm font-semibold text-[#1B8C50] hover:text-[#157040] flex items-center">
              View all <span className="ml-1">→</span>
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard" className="px-5 py-2.5 bg-primary text-white shadow-sm rounded-full text-sm font-semibold cursor-pointer">
              🛍️ All Items
            </Link>
            {categories.map(cat => (
              <Link key={cat.id} to={`/dashboard?category=${cat.name}`} className="px-5 py-2.5 bg-white border border-gray-200 shadow-sm rounded-full text-sm font-medium text-gray-700 cursor-pointer hover:border-primary hover:text-primary transition-colors">
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-8 bg-[#f5fbf7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Recent Listings</h2>
            <Link to="/dashboard" className="text-sm font-semibold text-[#1B8C50] hover:text-[#157040] flex items-center">
              See all <span className="ml-1">→</span>
            </Link>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar sm:grid sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex-none w-[170px] xs:w-[190px] sm:w-auto">
                  <ProductSkeleton />
                </div>
              ))
            ) : (
              products.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product._id || product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex-none w-[170px] xs:w-[190px] sm:w-auto"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Recently Sold */}
      {soldProducts.length > 0 && (
        <section className="py-8 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wide">Recently Sold</h2>
            </div>
            <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar sm:grid sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {soldProducts.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product._id || product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex-none w-[170px] xs:w-[190px] sm:w-auto"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How UniKart Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How UniKart Works</h2>
            <p className="text-gray-500 font-medium">Simple, safe, and campus-exclusive</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Link to={!user ? "/signup" : "/dashboard/profile"} className="group">
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 text-center flex flex-col items-center cursor-pointer hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 h-full"
              >
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Lock className="w-8 h-8 text-orange-500" />
                </div>
                <span className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">Step 01</span>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#1B8C50] transition-colors">Verify Your Account</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Sign up with your university email to join the trusted campus community.
                </p>
              </motion.div>
            </Link>

            <Link to="/dashboard" className="group">
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 text-center flex flex-col items-center cursor-pointer hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 h-full"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 text-blue-500" />
                </div>
                <span className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">Step 02</span>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#1B8C50] transition-colors">List or Browse</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Post items with photos and price, or browse hundreds of student listings.
                </p>
              </motion.div>
            </Link>

            <Link to={!user ? "/login" : "/dashboard/chat"} className="group">
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 text-center flex flex-col items-center cursor-pointer hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 h-full"
              >
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-8 h-8 text-purple-500" />
                </div>
                <span className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">Step 03</span>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#1B8C50] transition-colors">Chat & Deal</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Message sellers directly, negotiate price, and meet safely on campus.
                </p>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-[#f5fbf7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1B8C50] rounded-[32px] p-10 md:p-16 text-center text-white shadow-xl shadow-[#1B8C50]/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Join UniKart?</h2>
            <p className="text-green-50/90 text-lg mb-10 max-w-2xl mx-auto">
              Join hundreds of verified students buying and selling on campus
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {!user ? (
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-[#1B8C50] hover:bg-gray-50 rounded-xl font-semibold shadow-sm">
                    Create Free Account
                  </Button>
                </Link>
              ) : (
                <Link to="/sell">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-[#1B8C50] hover:bg-gray-50 rounded-xl font-semibold shadow-sm">
                    Start Selling Now
                  </Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10 rounded-xl font-semibold">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
