import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Clock } from 'lucide-react';
import { formatDistanceToNow } from '../../utils/formatDate';
import { Card } from '../ui/Card';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export function ProductCard({ product }) {
  const { user, setUser } = useAuth();
  const isLiked = user?.wishlist?.includes(product._id);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return alert('Please login to wishlist items');
    try {
      const response = await api.post(`/users/wishlist/${product._id}`);
      const updatedUser = { ...user, wishlist: response.data.data };
      setUser(updatedUser);
      localStorage.setItem('unikart_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const conditionColor = (product.condition || 'New').includes('New') 
    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
    : (product.condition || '').includes('Used')
      ? 'bg-orange-50 text-orange-600 border-orange-100'
      : 'bg-blue-50 text-blue-600 border-blue-100';

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
      <Link to={`/product/${product._id}`} className="block h-full">
        <Card className="overflow-hidden group h-full flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all rounded-[1.5rem]">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <img 
              src={product.images?.[0] || product.image} 
              alt={product.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {discount > 0 && (
                <div className="bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg">
                  {discount}% OFF
                </div>
              )}
              {product.featured && (
                <div className="bg-primary text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg">
                  FEATURED
                </div>
              )}
            </div>
            
            {/* Wishlist Button */}
            <button 
              className="absolute top-3 right-3 rounded-xl w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-md shadow-lg hover:bg-white transition-all active:scale-90"
              onClick={handleLike}
            >
              <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
            </button>

            {/* Bottom Info Bar Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 text-white">
                <img 
                  src={product.seller?.avatar || `https://ui-avatars.com/api/?name=${product.seller?.name || 'S'}&background=1B8C50&color=fff`} 
                  className="w-5 h-5 rounded-full border border-white/20" 
                />
                <span className="text-[9px] font-bold truncate">Seller: {product.seller?.name || 'Campus Peer'}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-start gap-2 mb-1.5">
              <h3 className="font-black text-gray-900 text-[13px] leading-tight line-clamp-2 flex-1">
                {product.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 mb-3">
               <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-tighter ${conditionColor}`}>
                {product.condition || 'New'}
              </span>
              <span className="text-[10px] font-bold text-gray-400">•</span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{product.category}</span>
            </div>
            
            <div className="mt-auto">
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-lg font-black text-gray-900 tracking-tight">₹{product.price}</span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-400 line-through font-medium">₹{product.originalPrice}</span>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex items-center gap-1 text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span className="text-[10px] font-bold truncate max-w-[80px]">{product.location || 'Campus'}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-bold">{formatDistanceToNow(product.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
