import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, MapPin, Clock, Eye, Package, ArrowLeft, ShoppingCart, CreditCard } from 'lucide-react';
import { formatDistanceToNow } from '../../utils/formatDate';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const { user, setUser } = useAuth();

  const isLiked = React.useMemo(() => user?.wishlist?.includes(product?._id), [user, product]);

  const debounceRef = React.useRef(null);

  const handleLike = React.useCallback(async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) return alert('Please login to wishlist items');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.post(`/users/wishlist/${product?._id}`);
        const updatedWishlist = res.data.data;
        const updatedUser = { ...user, wishlist: updatedWishlist };
        setUser(updatedUser);
        localStorage.setItem('unikart_user', JSON.stringify(updatedUser));
      } catch (err) {
        console.error('Error toggling wishlist:', err);
      }
    }, 250);
  }, [user, product, setUser]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product._id);
      alert('Product successfully added to your cart!');
    } catch (err) {
      console.error('Add to cart failed', err);
    } finally {
      setIsAdding(false);
    }
  };

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-20 text-center text-primary font-bold text-2xl animate-pulse">Loading Product...</div>;
  if (!product) return (
    <div className="p-20 text-center space-y-4">
      <h2 className="text-red-500 font-bold text-2xl">Product not found.</h2>
      <Link to="/dashboard">
        <button className="px-6 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold">Return to Dashboard</button>
      </Link>
    </div>
  );

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

  const sellerName = product.seller?.name || 'Campus Peer';

  // Dynamic Views count based on product ID
  const viewsCount = (id ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 15 : 5) + 3;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 w-full lg:h-[calc(100vh-100px)] flex flex-col justify-start lg:justify-center overflow-hidden">
      {/* Back to shop */}
      <div className="mb-4 shrink-0">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] font-black text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Back to shop
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center flex-1 min-h-0">
        {/* Left Column: Image */}
        <div className="relative h-full flex items-center justify-center max-h-[420px] lg:max-h-[480px]">
          <div className="relative w-full aspect-square max-w-[420px] lg:max-w-[480px] rounded-3xl overflow-hidden border border-gray-200/80 shadow-md bg-gray-50 flex items-center justify-center">
            <img 
              src={product.images?.[0] || product.image} 
              alt={product.title} 
              className="w-full h-full object-cover" 
            />
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md tracking-wider">
                -{discount}% OFF
              </div>
            )}
            
            <button 
              onClick={handleLike}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-all active:scale-90 border border-gray-100"
            >
              <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="flex flex-col justify-between h-full py-1 max-h-[420px] lg:max-h-[480px] space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
              {product.category}
            </span>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight tracking-tight">
              {product.title}
            </h1>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-base text-gray-400 line-through font-semibold">₹{product.originalPrice}</span>
            )}
          </div>

          {/* Badges/Pills Row */}
          <div className="flex flex-wrap gap-1.5">
            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider ${conditionClass}`}>
              {product.condition || 'New'}
            </span>
            
            <span className="text-[10px] font-bold px-3 py-1 rounded-full border border-gray-200 bg-gray-50/50 text-gray-500 flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              {product.seller?.college?.split(' ')[0]?.toLowerCase() || 'mit.edu'}
            </span>

            <span className="text-[10px] font-bold px-3 py-1 rounded-full border border-gray-200 bg-gray-50/50 text-gray-500 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Posted {formatDistanceToNow(product.createdAt)}
            </span>

            {/* Views counter (Cool Professional Feature 1) */}
            <span className="text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-100 bg-emerald-50/50 text-emerald-700 flex items-center gap-1.5 shrink-0">
              <Eye className="w-3.5 h-3.5" />
              {viewsCount} viewed today
            </span>
          </div>

          {/* Description Card */}
          <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200/50 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              Description
            </h3>
            <p className="text-[13px] font-medium text-gray-600 leading-relaxed max-h-[85px] overflow-y-auto no-scrollbar">
              {product.description || 'No description provided by the seller.'}
            </p>
          </div>

          {/* Seller Card */}
          <Link 
            to={`/user/${product.seller?.name || product.seller?._id || product.seller}`}
            className="bg-white rounded-2xl p-3.5 border border-gray-250/50 shadow-sm flex items-center gap-3 hover:border-primary/20 transition-all cursor-pointer group/card w-full"
          >
            {product.seller?.avatar && product.seller.avatar !== 'default-avatar.png' ? (
              <img 
                src={product.seller.avatar} 
                className="w-10 h-10 rounded-full border border-gray-150 shrink-0 object-cover group-hover/card:scale-105 transition-transform" 
                alt={sellerName}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#007AFF] text-white font-black flex items-center justify-center text-sm uppercase shadow-sm group-hover/card:scale-105 transition-transform shrink-0">
                {getInitials(sellerName)}
              </div>
            )}
            <div>
              <h4 className="font-bold text-gray-900 text-sm group-hover/card:text-primary transition-colors">{sellerName}</h4>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Seller (View Profile)</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
            </div>
          </Link>

          {/* Button row */}
          <div className="space-y-2">
            {product.status === 'sold' ? (
              <button disabled className="w-full bg-red-50 text-red-500 font-black text-xs uppercase tracking-wider py-4 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed border border-red-100">
                Sold Out
              </button>
            ) : user && (typeof product.seller === 'object' ? product.seller?._id : product.seller) !== user._id ? (
              <>
                {/* Main Action Buttons */}
                <div className="flex gap-2">
                  {/* Buy Now */}
                  <Link to={`/checkout/${product._id}`} className="flex-1">
                    <button className="w-full bg-[#1B8C50] hover:bg-[#157040] text-white font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-[#1B8C50]/15 active:scale-[0.99] transition-all">
                      <CreditCard className="w-4 h-4" /> Buy Now
                    </button>
                  </Link>

                  {/* Add to Cart */}
                  <button 
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="flex-1 bg-white hover:bg-gray-50 text-[#1B8C50] border-2 border-[#1B8C50] font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    <ShoppingCart className="w-4 h-4" /> {isAdding ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>

                {/* Sub Action Buttons */}
                <div className="flex gap-2">
                  <Link 
                    to="/dashboard/chat" 
                    state={{ 
                      sellerId: typeof product.seller === 'object' ? product.seller?._id : product.seller,
                      sellerName: sellerName, 
                      sellerAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}&background=1B8C50&color=fff`,
                      productTitle: product.title
                    }} 
                    className="flex-1"
                  >
                    <button className="w-full bg-[#007AFF] hover:bg-[#0072E5] text-white font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.99] transition-all">
                      <MessageCircle className="w-4 h-4" /> Message Seller
                    </button>
                  </Link>

                  {/* Share button */}
                  <button 
                    onClick={handleShare}
                    className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 flex items-center justify-center transition-all border border-gray-200/50 shadow-sm shrink-0 relative"
                    title="Share Product"
                  >
                    {copied && (
                      <span className="absolute -top-9 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap z-10">
                        Copied!
                      </span>
                    )}
                    <Share2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <button disabled className="flex-1 bg-gray-150 text-gray-400 font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed">
                  This is your product
                </button>
                <button 
                  onClick={handleShare}
                  className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 flex items-center justify-center transition-all border border-gray-200/50 shadow-sm shrink-0 relative"
                  title="Share Product"
                >
                  {copied && (
                    <span className="absolute -top-9 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap z-10">
                      Copied!
                    </span>
                  )}
                  <Share2 className="w-4.5 h-4.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
