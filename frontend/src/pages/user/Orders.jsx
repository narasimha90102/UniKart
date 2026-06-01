import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronRight, ChevronDown, ShoppingBag, MapPin, CreditCard, Hash, Calendar, User, MessageCircle, Star, Image, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [reviewedOrderIds, setReviewedOrderIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [ordersRes, reviewedRes] = await Promise.all([
          api.get('/orders/my-orders'),
          api.get('/reviews/my-reviewed-orders')
        ]);
        const rawOrders = ordersRes.data.data || [];
        const uniqueOrdersMap = new Map();
        rawOrders.forEach(o => {
          if (o && o._id) uniqueOrdersMap.set(o._id.toString(), o);
        });
        const uniqueOrders = Array.from(uniqueOrdersMap.values());
        
        setOrders(uniqueOrders);
        setReviewedOrderIds(reviewedRes.data.data || []);

        // Deep-linking: check if reviewOrderId is in URL query parameters
        const params = new URLSearchParams(window.location.search);
        const reviewOrderId = params.get('reviewOrderId');
        if (reviewOrderId) {
          const matchingOrder = uniqueOrders.find(o => o._id === reviewOrderId);
          if (matchingOrder && matchingOrder.status === 'completed' && !reviewedRes.data.data.includes(reviewOrderId)) {
            setSelectedOrderForReview(matchingOrder);
          }
        }
      } catch (err) {
        console.error('Failed to fetch initial data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleReviewSuccess = (orderId) => {
    setReviewedOrderIds(prev => [...prev, orderId]);
    setSelectedOrderForReview(null);
  };

  if (loading) return <div className="text-center py-20 text-primary animate-pulse font-bold">Syncing your campus orders...</div>;

  const upcoming = orders.filter(o => o.status === 'pending');
  const recent = orders.filter(o => o.status === 'completed');

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-12 pb-24 relative">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">My Orders</h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Track your campus purchases</p>
      </div>

      {/* Upcoming Orders */}
      {upcoming.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
            Active Orders
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {upcoming.map(order => (
              <OrderCard 
                key={order._id} 
                order={order} 
                reviewedOrderIds={reviewedOrderIds} 
                onRateClick={setSelectedOrderForReview} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="space-y-6">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Past Purchases</h3>
        {recent.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {recent.map(order => (
              <OrderCard 
                key={order._id} 
                order={order} 
                reviewedOrderIds={reviewedOrderIds} 
                onRateClick={setSelectedOrderForReview} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-400">No orders yet</h3>
            <p className="text-sm text-gray-400 mt-1">Your campus purchases will appear here.</p>
          </div>
        )}
      </div>

      {/* Embedded High-Contrast Review Modal */}
      <AnimatePresence>
        {selectedOrderForReview && (
          <ReviewModal 
            order={selectedOrderForReview} 
            onClose={() => setSelectedOrderForReview(null)} 
            onSuccess={handleReviewSuccess}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function OrderCard({ order, reviewedOrderIds, onRateClick }) {
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();

  const productId = order.product?._id || order.product?.id;
  const sellerName = order.seller?.name || 'Campus Seller';
  const orderId = order._id || 'N/A';
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
  const orderTime = order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 group hover:border-primary/20 transition-all shadow-sm hover:shadow-md overflow-hidden">
      {/* Main Row */}
      <div className="flex items-center gap-6 p-6">
        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
          <img 
            src={order.product?.images?.[0] || 'https://via.placeholder.com/200'} 
            alt={order.product?.title} 
            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-lg font-black text-gray-900 truncate">{order.product?.title || 'Unknown Item'}</h4>
              <p className="text-xs font-bold text-gray-500 mt-1">
                Sold by{' '}
                <Link 
                  to={`/user/${order.seller?.name || order.seller?._id || order.seller}`}
                  className="text-primary hover:text-emerald-700 font-black uppercase tracking-tighter transition-colors hover:underline"
                >
                  {sellerName}
                </Link>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-gray-900">₹{order.price}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-black uppercase rounded-full ${
              order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'completed' ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`} />
              {order.status}
            </span>
            <button 
              onClick={() => setExpanded(!expanded)}
              className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
            >
              {expanded ? 'Hide Details' : 'View Details'} 
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Details Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 border-t border-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {/* Order ID */}
                <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Hash className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                    <p className="text-xs font-bold text-gray-700 truncate max-w-[140px]" title={orderId}>{orderId.slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ordered On</p>
                    <p className="text-xs font-bold text-gray-700">{orderDate} {orderTime && `· ${orderTime}`}</p>
                  </div>
                </div>

                {/* Seller */}
                <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Seller</p>
                    <p className="text-xs font-bold text-gray-700">{sellerName}</p>
                  </div>
                </div>

                {/* Payment */}
                <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Payment</p>
                    <p className="text-xs font-bold text-gray-700">
                      {order.paymentMethod || 'Campus Meet-up'} · <span className={order.status === 'completed' ? 'text-emerald-600' : 'text-orange-600'}>{order.status === 'completed' ? 'Paid' : 'Pending'}</span>
                    </p>
                  </div>
                </div>

                {/* Meetup Location */}
                {order.meetupLocation && (
                  <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl sm:col-span-2">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Meetup Location</p>
                      <p className="text-xs font-bold text-gray-700">{order.meetupLocation}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-5">
                {productId && (
                  <Link 
                    to={`/product/${productId}`} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary/5 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 transition-colors border border-primary/10"
                  >
                    <Package className="w-3.5 h-3.5" />
                    View Product
                  </Link>
                )}

                {order.status === 'completed' && (
                  reviewedOrderIds.includes(order._id) ? (
                    <button 
                      disabled
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed border border-gray-200"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      Reviewed
                    </button>
                  ) : (
                    <button 
                      onClick={() => onRateClick(order)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-amber-500/10 shadow-sm shadow-amber-500/10 active:scale-[0.98]"
                    >
                      <Star className="w-3.5 h-3.5 fill-current animate-pulse" />
                      Rate Product
                    </button>
                  )
                )}

                {order.seller && (
                  <Link 
                    to={`/dashboard/chat`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors border border-gray-100"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Message Seller
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewModal({ order, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sellerName = order.seller?.name || 'Campus Seller';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      return setErrorMsg('Please write a quick comment about your experience.');
    }
    
    setSubmitting(true);
    setErrorMsg('');
    try {
      const reviewPayload = {
        orderId: order._id,
        rating,
        reviewText,
        images: imageUrl ? [imageUrl] : []
      };

      await api.post('/reviews', reviewPayload);
      alert('Thank you! Your rating and review have been saved.');
      onSuccess(order._id);
    } catch (err) {
      console.error('Error submitting review:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-hidden"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
      >
        {/* Header banner */}
        <div className="bg-primary/5 px-8 py-6 border-b border-gray-50 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Rate Your Purchase</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Transaction with {sellerName}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-900 flex items-center justify-center border border-gray-100 transition-colors shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form area */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh] no-scrollbar">
          
          {/* Product card summary inside modal */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden shrink-0 border border-gray-100">
              <img src={order.product?.images?.[0] || 'https://via.placeholder.com/150'} alt="product" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-gray-900 text-sm truncate">{order.product?.title || 'Campus Item'}</h4>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-0.5">₹{order.price} · Completed Deal</span>
            </div>
          </div>

          {/* Interactive Star rating selector */}
          <div className="text-center space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Select Rating</label>
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoveredRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <Star 
                      className={`w-10 h-10 ${
                        active ? 'text-amber-400 fill-current' : 'text-gray-200'
                      } transition-colors`} 
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] font-extrabold text-amber-500 uppercase tracking-wider">
              {rating === 5 && '⭐️ Excellent! Outstanding Deal'}
              {rating === 4 && '👍 Great Purchase'}
              {rating === 3 && '👌 Good, standard transaction'}
              {rating === 2 && '👎 Below expectations'}
              {rating === 1 && '🤢 Unacceptable transaction'}
            </p>
          </div>

          {/* Review comment field */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Write Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="How was the product quality? Was the campus meetup prompt? Share your feedback..."
              rows={4}
              maxLength={500}
              className="w-full bg-gray-50 border border-gray-200 rounded-3xl p-4 text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-all resize-none"
            />
            <div className="text-right text-[10px] font-bold text-gray-400 uppercase">
              {reviewText.length}/500 chars
            </div>
          </div>

          {/* Optional Image Url */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-gray-300" />
              Optional Product Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste any photo URL of the product (optional)..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          {/* Error Message display */}
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 text-center"
            >
              ⚠️ {errorMsg}
            </motion.div>
          )}

          {/* Action buttons footer */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-2xl h-12 text-xs font-black uppercase tracking-wider border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-2xl h-12 text-xs font-black uppercase tracking-wider bg-primary hover:bg-[#157040] shadow-md shadow-primary/10 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>

        </form>
      </motion.div>
    </motion.div>
  );
}
