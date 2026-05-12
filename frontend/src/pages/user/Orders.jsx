import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import api from '../../utils/api';

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
  return (
    <div className="flex items-center gap-6 p-6 bg-white rounded-[2rem] border border-gray-100 group hover:border-primary/20 transition-all shadow-sm hover:shadow-md">
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
              Sold by <span className="text-primary font-black uppercase tracking-tighter">{order.seller?.name || 'Campus Seller'}</span>
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
          <button className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
            View Details <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
