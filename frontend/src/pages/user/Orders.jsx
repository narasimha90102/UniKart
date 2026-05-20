import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronRight, ChevronDown, ShoppingBag, MapPin, CreditCard, Hash, Calendar, User, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        setOrders(res.data.data);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-20 text-primary animate-pulse font-bold">Syncing your campus orders...</div>;

  const upcoming = orders.filter(o => o.status === 'pending');
  const recent = orders.filter(o => o.status === 'completed');

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-12 pb-24">
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
            {upcoming.map(order => <OrderCard key={order._id} order={order} />)}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="space-y-6">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Past Purchases</h3>
        {recent.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {recent.map(order => <OrderCard key={order._id} order={order} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-400">No orders yet</h3>
            <p className="text-sm text-gray-400 mt-1">Your campus purchases will appear here.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();

  const productId = order.product?._id || order.product?.id;
  const sellerName = order.seller?.name || 'Campus Seller';
  const buyerName = order.buyer?.name || user?.name || 'You';
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
                Sold by <span className="text-primary font-black uppercase tracking-tighter">{sellerName}</span>
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
