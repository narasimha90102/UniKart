import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, MapPin, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useCart } from '../../context/CartContext';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [adding, setAdding] = React.useState(false);
  const [buying, setBuying] = React.useState(false);

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

  const handleBuy = () => {
    if (!product || isSold) return;
    navigate(`/checkout/${id}`);
  };

  if (loading) return <div className="p-20 text-center text-primary font-bold text-2xl animate-pulse">Loading Product...</div>;
  if (!product) return (
    <div className="p-20 text-center space-y-4">
      <h2 className="text-red-500 font-bold text-2xl">Product not found.</h2>
      <Link to="/dashboard">
        <Button variant="outline" className="rounded-xl">Return to Dashboard</Button>
      </Link>
    </div>
  );

  const isSold = product.status === 'sold';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <Link to={`/dashboard?category=${product.category}`} className="hover:text-white transition-colors">{product.category}</Link>
        <span>/</span>
        <span className="text-gray-200 truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="relative">
          {isSold && (
            <div className="absolute top-6 left-6 z-10 bg-red-600 text-white font-black px-6 py-2 rounded-full shadow-2xl rotate-[-5deg] border-2 border-white tracking-widest text-sm uppercase">
              Out of Stock / Sold
            </div>
          )}
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`aspect-[4/3] rounded-2xl overflow-hidden glass-card border-white/10 ${isSold ? 'grayscale opacity-50' : ''}`}
            >
              <img src={product.images?.[0]} alt={product.title} className="w-full h-full object-cover" />
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
              {product.images?.map((img, i) => (
                <div key={i} className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${i === 0 ? 'border-primary' : 'border-transparent hover:border-white/20'}`}>
                  <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover opacity-80 hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${isSold ? 'text-gray-500' : ''}`}>{product.title}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-yellow-500 flex items-center gap-1">★ {product.rating || '4.5'}</span>
                  <span className="text-gray-400 underline cursor-pointer">{product.reviews || '12'} reviews</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400">Condition: <strong className="text-white">{product.condition}</strong></span>
                </div>
              </div>
              <Button variant="glass" size="icon" className="shrink-0 rounded-full w-12 h-12">
                <Heart className="w-5 h-5 text-gray-300" />
              </Button>
            </div>

            <div className="glass-panel rounded-2xl p-6 border-white/5 space-y-4">
              <div className="flex items-end gap-3">
                <span className={`text-4xl font-extrabold ${isSold ? 'text-gray-500 line-through' : 'text-white'}`}>₹{product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through mb-1">₹{product.originalPrice}</span>
                )}
                {isSold ? (
                  <Badge variant="outline" className="mb-2 text-red-500 border-red-500/20 bg-red-500/5">SOLD OUT</Badge>
                ) : product.originalPrice && (
                  <Badge variant="destructive" className="mb-2">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </Badge>
                )}
              </div>
              
              {!isSold && (
                <p className="text-sm text-green-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> 100% Secure Transaction
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  size="lg" 
                  className={`flex-1 rounded-full text-base ${isSold ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}`}
                  onClick={handleBuy}
                  disabled={buying || isSold}
                >
                  {isSold ? 'Out of Stock' : (buying ? 'Processing...' : 'Buy Now')}
                </Button>
                {user && (typeof product.seller === 'object' ? product.seller?._id : product.seller) !== user._id && (
                  <Link 
                    to="/dashboard/chat" 
                    state={{ 
                      sellerId: typeof product.seller === 'object' ? product.seller?._id : product.seller,
                      sellerName: typeof product.seller === 'object' ? product.seller?.name : 'Seller', 
                      sellerAvatar: `https://ui-avatars.com/api/?name=${(typeof product.seller === 'object' ? product.seller?.name : 'Seller')}&background=1B8C50&color=fff`,
                      productTitle: product.title
                    }} 
                    className="flex-1"
                  >
                    <Button variant="outline" size="lg" className="w-full rounded-full text-base border-white/20">
                      <MessageCircle className="w-5 h-5 mr-2" /> Chat with Seller
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b border-white/10 pb-2">Description</h3>
              <p className="text-gray-300 leading-relaxed">
                {product.description}
                <br/><br/>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-xl font-bold">
                {product.seller?.name?.[0] || '?'}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{product.seller?.name || 'Unknown Seller'}</h4>
                <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" /> {product.seller?.college || 'Saveetha Engineering College'}
                </p>
              </div>
              <Link to={`/user/${encodeURIComponent(product.seller?.name || 'seller')}`}>
                <Button variant="outline" size="sm" className="rounded-full hover:bg-primary hover:text-white hover:border-primary transition-colors">
                  View Profile
                </Button>
              </Link>
            </div>
            
          </motion.div>
        </div>
      </div>
    </div>
  );
}
