import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Calendar, MessageCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ProductCard } from '../../components/shared/ProductCard';
import { products } from '../../data/mockData';

export function SellerProfile() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name || 'Unknown Seller');
  
  // Find all products by this seller
  const sellerProducts = products.filter(p => p.seller === decodedName);
  
  // Mock some stats
  const joinedDate = 'August 2023';
  const totalSales = Math.floor(Math.random() * 20) + 5;
  const rating = (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar - Profile Info */}
        <aside className="w-full md:w-80 shrink-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-3xl p-8 sticky top-24 shadow-xl border border-gray-100"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-green-300 flex items-center justify-center text-5xl font-bold text-white shadow-lg shadow-primary/20 mb-6">
                {decodedName.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{decodedName}</h1>
              <p className="text-gray-500 mb-4 flex items-center gap-1 justify-center">
                <MapPin className="w-4 h-4" /> Campus Campus
              </p>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full text-green-700 text-sm font-medium mb-6">
                <ShieldCheck className="w-4 h-4" /> Verified Student
              </div>

              <div className="w-full grid grid-cols-2 gap-4 border-y border-gray-100 py-6 mb-6">
                <div>
                  <div className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                    {rating} <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Rating</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalSales}</div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Items Sold</p>
                </div>
              </div>

              <div className="w-full space-y-4 text-left">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  Joined {joinedDate}
                </div>
                
                <Link to="/dashboard/chat" className="block w-full mt-4">
                  <Button className="w-full rounded-xl" size="lg">
                    <MessageCircle className="w-5 h-5 mr-2" /> Message Seller
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </aside>

        {/* Right Content - Listings */}
        <main className="flex-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Active Listings</h2>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                {sellerProducts.length} Items
              </span>
            </div>

            {sellerProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sellerProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-3xl p-12 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-3xl">📦</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Listings</h3>
                <p className="text-gray-500">This user currently has no items for sale.</p>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
