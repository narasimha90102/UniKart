import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, ChevronRight, ArrowLeft, ShoppingCart, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';

export function Cart() {
  const { cart, removeFromCart, cartCount, cartTotal, loading } = useCart();

  if (loading && cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold">Reviewing your bag...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingCart className="w-12 h-12 text-gray-300" />
          </div>
          <h1 className="text-3xl font-black text-gray-900">Your cart is empty</h1>
          <p className="text-gray-500 max-w-sm mx-auto font-medium">
            Looks like you haven't added any campus deals to your cart yet. Let's find something great!
          </p>
          <Link to="/marketplace">
            <Button size="lg" className="rounded-2xl px-10 h-14 bg-primary hover:bg-primary/90 mt-4">
              Explore Marketplace <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-10">
        <Link to="/marketplace" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Shopping Bag <span className="text-primary">({cartCount})</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div 
                key={item.product._id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-6 rounded-3xl border border-gray-100 flex gap-6 group hover:shadow-xl hover:shadow-gray-200/50 transition-all"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-gray-50 shrink-0 border border-gray-50">
                  <img src={item.product.images?.[0]} alt={item.product.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">{item.product.title}</h3>
                      <button 
                        onClick={() => removeFromCart(item.product._id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{item.product.category}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                      <span className="px-4 py-1 text-sm font-black text-gray-700">Qty: {item.quantity}</span>
                    </div>
                    <p className="text-xl font-black text-gray-900">₹{item.product.price * item.quantity}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-24">
            <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Subtotal</span>
                <span className="text-gray-900 font-bold">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Platform Fee</span>
                <span className="text-emerald-500 font-bold uppercase text-xs">Free</span>
              </div>
              <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
                <span className="text-lg font-black text-gray-900">Total Amount</span>
                <span className="text-3xl font-black text-primary tracking-tighter">₹{cartTotal}</span>
              </div>
            </div>
            
            <Button size="lg" className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-base font-bold shadow-lg shadow-primary/20 mb-6">
              Proceed to Checkout
            </Button>

            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl text-emerald-700">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <p className="text-[10px] font-bold uppercase leading-tight">Secure Campus Transaction Guaranteed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
