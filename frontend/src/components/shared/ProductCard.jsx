import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Clock } from 'lucide-react';
import { formatDistanceToNow } from '../../utils/formatDate';
import { Card } from '../ui/Card';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export const ProductCard = memo(function ProductCard({ product }) {
  const { user, setUser } = useAuth();
  const [avatarError, setAvatarError] = React.useState(false);
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

  // Render condition styling
  let conditionClass = 'bg-gray-50 text-gray-600 border-gray-100';
  const cond = (product.condition || '').toLowerCase();
  if (cond.includes('new')) {
    conditionClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
  } else if (cond.includes('like')) {
    conditionClass = 'bg-blue-50 text-blue-600 border-blue-100';
  } else if (cond.includes('good')) {
    conditionClass = 'bg-amber-50 text-amber-700 border-amber-100';
  } else if (cond.includes('fair')) {
    conditionClass = 'bg-orange-50 text-orange-700 border-orange-100';
  }

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // List of avatar background colors for visual aesthetics
  const getAvatarBg = (name) => {
    if (!name) return 'bg-emerald-600';
    const charCode = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
    const colors = [
      'bg-blue-600',
      'bg-emerald-600',
      'bg-indigo-600',
      'bg-purple-600',
      'bg-sky-600',
      'bg-teal-600',
      'bg-cyan-600',
      'bg-amber-600'
    ];
    return colors[charCode % colors.length];
  };

  const sellerName = product.seller?.name || 'Campus Peer';
  const initials = getInitials(sellerName);
  const avatarBg = getAvatarBg(sellerName);

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
      <Link to={`/product/${product._id}`} className="block h-full">
        <Card className="overflow-hidden group h-full flex flex-col bg-white border border-gray-150 shadow-sm hover:shadow-md hover:border-gray-200 transition-all rounded-[1rem] p-2.5">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gray-50 rounded-lg">
            <img 
              src={product.images?.[0] || product.image} 
              alt={product.title} 
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {product.status === 'sold' && (
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center z-10 backdrop-blur-[0.5px]">
                <span className="bg-white/95 text-gray-900 text-[11px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest shadow-md border border-gray-100/50">
                  SOLD
                </span>
              </div>
            )}
            
            {/* Badges Overlay */}
            <div className="absolute top-2 left-2">
              {discount > 0 && (
                <div className="bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  -{discount}%
                </div>
              )}
            </div>
            
            {/* Wishlist Button */}
            <button 
              className="absolute top-2 right-2 rounded-full w-7 h-7 flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-all active:scale-90"
              onClick={handleLike}
            >
              <Heart className={`w-3.5 h-3.5 transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
            </button>
          </div>
          
          <div className="pt-2 pb-0.5 flex-1 flex flex-col">
            <h3 className="font-bold text-gray-900 text-[14px] leading-snug line-clamp-1 mb-0.5">
              {product.title}
            </h3>

            <div className="flex items-baseline gap-1.5 mb-1.5">
              <span className="text-base font-black text-gray-900 tracking-tight">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-[12px] text-gray-400 line-through font-medium">₹{product.originalPrice}</span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.25 rounded-full border uppercase tracking-tighter ${conditionClass}`}>
                {product.condition || 'New'}
              </span>
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider truncate max-w-[80px]">
                {product.category}
              </span>
            </div>
            
            <hr className="border-gray-100 my-1.5" />
            
            <div className="flex items-center justify-between mt-auto pt-1">
              <Link 
                to={`/user/${product.seller?._id || product.seller}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 min-w-0 hover:text-primary transition-all cursor-pointer group"
              >
                {product.seller?.avatar && product.seller.avatar !== 'default-avatar.png' && !avatarError ? (
                  <img 
                    src={product.seller.avatar} 
                    className="w-5 h-5 rounded-full border border-gray-100 shrink-0 object-cover group-hover:scale-105 transition-transform" 
                    alt={sellerName}
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className={`w-5 h-5 rounded-full ${avatarBg} text-white font-bold flex items-center justify-center text-[10px] uppercase select-none shrink-0 group-hover:scale-105 transition-transform`}>
                    {initials}
                  </div>
                )}
                <span className="text-[13px] font-semibold text-gray-600 truncate group-hover:text-primary transition-colors">{sellerName}</span>
              </Link>
              
              {product.status === 'sold' ? (
                <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded border border-gray-150 shadow-2xs">
                  Sold: {new Date(product.updatedAt || product.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              ) : (
                <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">
                  {formatDistanceToNow(product.createdAt)}
                </span>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
});
