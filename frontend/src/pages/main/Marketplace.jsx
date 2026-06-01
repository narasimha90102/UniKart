import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Grid, 
  List, 
  SlidersHorizontal, 
  X, 
  ShoppingBag,
  Book,
  Laptop,
  Smartphone,
  Activity,
  Home,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ProductCard } from '../../components/shared/ProductCard';
import { ProductSkeleton } from '../../components/shared/ProductSkeleton';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useTheme } from '../../context/ThemeContext';

export function Marketplace() {
  const { t } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, fetchProducts, loading] = useProducts();
  const [categories] = useCategories();

  const getCategoryTranslation = (name) => {
    if (name === 'Books') return t('catBooks');
    if (name === 'Electronics') return t('catElectronics');
    if (name === 'Gadgets') return t('catGadgets');
    if (name === 'Furniture') return t('catFurniture');
    if (name === 'Hostel') return t('catHostel');
    if (name === 'Clothing') return t('catClothing');
    return name;
  };
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState('newest');

  // Sync state with URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    if (category) setSelectedCategory(category);
    if (search) setSearchQuery(search);
  }, [searchParams]);

  // Handle filter changes
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery) {
      newParams.set('search', searchQuery);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(query) || 
        p.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  return (
    <div className="pt-20 min-h-screen bg-[#f5fbf7]">
      {/* Header Section */}
      <section className="bg-white border-b border-gray-100 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{t('marketplace')}</h1>
              <p className="text-gray-500 font-medium">Find exactly what you need from your fellow students.</p>
            </div>
            
            <form onSubmit={handleSearch} className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 focus:border-[#1B8C50] focus:ring-4 focus:ring-[#1B8C50]/10 outline-none transition-all"
              />
            </form>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-8">
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">{t('categories')}</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('All')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === 'All' 
                      ? 'bg-[#1B8C50] text-white' 
                      : 'text-gray-600 hover:bg-white hover:text-[#1B8C50]'
                    }`}
                  >
                    {t('allCategories')}
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === cat.name 
                        ? 'bg-[#1B8C50] text-white' 
                        : 'text-gray-600 hover:bg-white hover:text-[#1B8C50]'
                      }`}
                    >
                      {getCategoryTranslation(cat.name)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">{t('priceRange')}</h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-[#1B8C50]"
                  />
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                    <span>₹0</span>
                    <span className="text-[#1B8C50]">Up to ₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Condition */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Condition</h3>
                <div className="space-y-2">
                  {['Brand New', 'Like New', 'Good', 'Fair'].map(cond => (
                    <label key={cond} className="flex items-center gap-3 group cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1B8C50] focus:ring-[#1B8C50]" />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{cond}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden rounded-xl gap-2"
                >
                  <Filter className="w-4 h-4" /> Filters
                </Button>
                <span className="text-sm font-medium text-gray-500">
                  Showing {filteredProducts.length} results
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center bg-gray-50 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#1B8C50]' : 'text-gray-400'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#1B8C50]' : 'text-gray-400'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 pl-3 pr-8 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:border-[#1B8C50] outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory !== 'All' || searchQuery) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1B8C50]/10 text-[#1B8C50] text-xs font-bold">
                    {selectedCategory}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => handleCategoryChange('All')} />
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1B8C50]/10 text-[#1B8C50] text-xs font-bold">
                    Search: {searchQuery}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => {
                      setSearchQuery('');
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('search');
                      setSearchParams(newParams);
                    }} />
                  </span>
                )}
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div
                layout
                className={`grid gap-6 ${
                  viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3' 
                  : 'grid-cols-1'
                }`}
              >
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('noProductsFound')}</h3>
                <p className="text-gray-500 max-w-xs mx-auto mb-6">
                  {t('noProductsFoundDesc')}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setPriceRange([0, 50000]);
                    setSearchParams({});
                  }}
                  className="rounded-xl"
                >
                  {t('clearFilters')}
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer (Portal would be better but simple state for now) */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white z-[101] shadow-2xl p-6 lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-gray-900">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Mobile Categories */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{t('categories')}</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCategoryChange('All')}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        selectedCategory === 'All' 
                        ? 'bg-[#1B8C50] text-white shadow-lg shadow-[#1B8C50]/20' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {t('allCategories')}
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.name)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          selectedCategory === cat.name 
                          ? 'bg-[#1B8C50] text-white shadow-lg shadow-[#1B8C50]/20' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {getCategoryTranslation(cat.name)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Price */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{t('priceRange')}</h3>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-[#1B8C50]"
                  />
                  <div className="mt-2 text-sm font-bold text-[#1B8C50]">Up to ₹{priceRange[1]}</div>
                </div>

                <Button className="w-full rounded-2xl h-14 bg-[#1B8C50]" onClick={() => setIsFilterOpen(false)}>
                  {t('apply')}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
