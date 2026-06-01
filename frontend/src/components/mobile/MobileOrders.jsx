import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ShoppingBag, Package, ChevronRight, ChevronDown,
  Hash, Calendar, User, CreditCard, MapPin, MessageCircle,
  RefreshCw, CheckCircle2, XCircle, Clock, RotateCcw, Truck
} from 'lucide-react';
import api from '../../utils/api';

const FILTERS = [
  { key: 'all',        label: 'All' },
  { key: 'pending',    label: 'Processing' },
  { key: 'completed',  label: 'Delivered' },
  { key: 'cancelled',  label: 'Cancelled' },
  { key: 'returned',   label: 'Returned' },
];

const STATUS_CONFIG = {
  completed: {
    label: 'Delivered',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Processing',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    icon: Clock,
    pulse: true,
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-red-100',
    text: 'text-red-600',
    dot: 'bg-red-500',
    icon: XCircle,
  },
  returned: {
    label: 'Returned',
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
    icon: RotateCcw,
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
}

function MobileOrderCard({ order, onBuyAgain }) {
  const [expanded, setExpanded] = useState(false);

  const productId = order.product?._id || order.product?.id;
  const sellerName = order.seller?.name || 'Campus Seller';
  const orderId = order._id || 'N/A';
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';
  const orderTime = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '';
  const isPaid = order.status === 'completed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Card top row */}
      <div className="flex gap-3 p-4">
        {/* Image */}
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
          <img
            src={order.product?.images?.[0] || 'https://placehold.co/200x200?text=Item'}
            alt={order.product?.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-black text-gray-900 leading-tight line-clamp-2 flex-1">
              {order.product?.title || 'Unknown Item'}
            </h4>
            <p className="text-base font-black text-gray-900 shrink-0">₹{order.price}</p>
          </div>

          <p className="text-[10px] font-bold text-gray-400 mt-1">
            Sold by <span className="text-[#1B8C50] font-black">{sellerName}</span>
          </p>

          <div className="flex items-center justify-between mt-2">
            <StatusBadge status={order.status} />
            <p className="text-[9px] font-bold text-gray-400 uppercase">{orderDate}</p>
          </div>
        </div>
      </div>

      {/* Order ID strip */}
      <div className="mx-4 mb-3 px-3 py-2 bg-gray-50 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="w-3 h-3 text-gray-400" />
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Order</span>
          <span className="text-[10px] font-black text-gray-700">#{orderId.slice(-8).toUpperCase()}</span>
        </div>
        <span className={`text-[9px] font-black uppercase ${isPaid ? 'text-emerald-600' : 'text-orange-500'}`}>
          {isPaid ? 'Paid' : 'Pending Payment'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 px-4 pb-3">
        {productId && (
          <Link
            to={`/product/${productId}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#1B8C50]/5 text-[#1B8C50] border border-[#1B8C50]/15 rounded-xl text-[9px] font-black uppercase tracking-wider active:scale-95 transition-transform"
          >
            <Truck className="w-3 h-3" />
            Track Order
          </Link>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl text-[9px] font-black uppercase tracking-wider active:scale-95 transition-transform"
        >
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          {expanded ? 'Hide' : 'View Details'}
        </button>
        {productId && (
          <Link
            to={`/product/${productId}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#1B8C50] text-white rounded-xl text-[9px] font-black uppercase tracking-wider active:scale-95 transition-transform shadow-sm shadow-[#1B8C50]/20"
          >
            <RefreshCw className="w-3 h-3" />
            Buy Again
          </Link>
        )}
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mx-4 mb-4 p-4 bg-gray-50 rounded-2xl space-y-3 border border-gray-100">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Order Details</p>

              <div className="grid grid-cols-2 gap-2">
                {/* Date */}
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-100">
                  <Calendar className="w-3.5 h-3.5 text-[#1B8C50] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] font-black text-gray-400 uppercase">Date</p>
                    <p className="text-[10px] font-black text-gray-700 truncate">{orderDate}</p>
                    {orderTime && <p className="text-[8px] text-gray-400">{orderTime}</p>}
                  </div>
                </div>

                {/* Seller */}
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-100">
                  <User className="w-3.5 h-3.5 text-[#1B8C50] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] font-black text-gray-400 uppercase">Seller</p>
                    <p className="text-[10px] font-black text-gray-700 truncate">{sellerName}</p>
                  </div>
                </div>

                {/* Payment */}
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-100">
                  <CreditCard className="w-3.5 h-3.5 text-[#1B8C50] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] font-black text-gray-400 uppercase">Payment</p>
                    <p className="text-[10px] font-black text-gray-700 truncate">{order.paymentMethod || 'Campus Meet-up'}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-100">
                  <Package className="w-3.5 h-3.5 text-[#1B8C50] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] font-black text-gray-400 uppercase">Amount</p>
                    <p className="text-[10px] font-black text-gray-700">₹{order.price}</p>
                  </div>
                </div>
              </div>

              {/* Meetup location full-width */}
              {order.meetupLocation && (
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-100">
                  <MapPin className="w-3.5 h-3.5 text-[#1B8C50] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] font-black text-gray-400 uppercase">Meetup Location</p>
                    <p className="text-[10px] font-black text-gray-700 break-words">{order.meetupLocation}</p>
                  </div>
                </div>
              )}

              {/* Message Seller */}
              {order.seller && (
                <Link
                  to="/dashboard/chat"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-600 active:scale-95 transition-transform"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Message Seller
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function MobileOrders({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        setOrders(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = activeFilter === 'all'
    ? orders
    : orders.filter(o => o.status === activeFilter);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[200] bg-[#f5fbf7] flex flex-col md:hidden"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm px-4 pt-12 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight">Your Orders</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {loading ? 'Loading...' : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'} found`}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all active:scale-95 ${
                activeFilter === f.key
                  ? 'bg-[#1B8C50] text-white shadow-sm shadow-[#1B8C50]/20'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-3">
        {loading ? (
          /* Skeleton loader */
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[1.5rem] border border-gray-100 p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
                  <div className="h-5 bg-gray-100 rounded-full w-1/3 mt-3" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
                <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
                <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
              </div>
            </div>
          ))
        ) : filtered.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filtered.map(order => (
              <MobileOrderCard key={order._id} order={order} />
            ))}
          </AnimatePresence>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center"
          >
            <div className="w-24 h-24 rounded-[2rem] bg-[#1B8C50]/8 border border-[#1B8C50]/10 flex items-center justify-center mb-5">
              <ShoppingBag className="w-12 h-12 text-[#1B8C50]/40" />
            </div>
            <h3 className="text-lg font-black text-gray-800 tracking-tight">No orders here</h3>
            <p className="text-sm font-medium text-gray-400 mt-1 max-w-[220px]">
              {activeFilter === 'all'
                ? 'Your campus purchases will appear here once you place an order.'
                : `No ${FILTERS.find(f => f.key === activeFilter)?.label.toLowerCase()} orders yet.`}
            </p>
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="mt-5 px-5 py-2 bg-[#1B8C50] text-white rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
              >
                View All Orders
              </button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
