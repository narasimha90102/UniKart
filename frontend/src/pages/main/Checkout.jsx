import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Wallet, CreditCard, Smartphone, Banknote, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../utils/api';

export function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const paymentMethods = [
    { id: 'cash', name: 'Cash on Delivery / Meetup', icon: Banknote, color: 'bg-green-50 text-green-600' },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) return;
    setIsProcessing(true);
    
    // Smooth transition to direct chat-negotiation flow
    setTimeout(() => {
      navigate('/dashboard/chat', { 
        state: { 
          sellerId: product.seller?._id || product.seller, 
          sellerName: product.seller?.name || 'Seller', 
          sendOrderRequest: true,
          productId: product._id,
          productPrice: product.price,
          productTitle: product.title
        } 
      });
    }, 1500);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary font-bold">Loading Secure Checkout...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <Link to={`/product/${id}`} className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm uppercase tracking-widest">Back to Product</span>
        </Link>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div 
              key="checkout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Payment Methods */}
              <div className="space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Select Payment Method</h2>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      const isActive = selectedMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                            isActive 
                              ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                              : 'border-gray-50 bg-gray-50/50 hover:border-gray-200 hover:bg-white'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method.color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className={`font-bold text-lg ${isActive ? 'text-primary' : 'text-gray-700'}`}>{method.name}</span>
                          {isActive && (
                            <div className="ml-auto w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-50">
                    <p className="text-xs text-gray-400 mb-6 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Your transaction is secured with UniKart Campus Encryption
                    </p>
                    <Button 
                      onClick={handlePayment}
                      disabled={!selectedMethod || isProcessing}
                      size="lg" 
                      className="w-full h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/20"
                    >
                      {isProcessing ? 'Connecting with Seller...' : `Request Meetup Collection (₹${product.price})`}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-28">
                  <h2 className="text-xl font-black text-gray-900 mb-6 tracking-tight uppercase">Order Summary</h2>
                  <div className="flex gap-4 mb-6">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                      <img src={product.images?.[0]} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 line-clamp-2">{product.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">Condition: {product.condition}</p>
                      <p className="text-lg font-black text-primary mt-1">₹{product.price}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-50">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Item Price</span>
                      <span className="font-bold text-gray-700">₹{product.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Campus Delivery</span>
                      <span className="text-emerald-600 font-bold">FREE</span>
                    </div>
                    <div className="flex justify-between text-lg pt-4 border-t border-gray-50">
                      <span className="font-black text-gray-900">Total Amount</span>
                      <span className="font-black text-primary">₹{product.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center bg-white rounded-[3rem] p-12 shadow-2xl border border-gray-50"
            >
              <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Payment Successful!</h2>
              <p className="text-gray-500 mb-8">The item has been successfully purchased and marked as **SOLD**. You can now coordinate with the seller.</p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate('/dashboard')} className="w-full rounded-2xl h-12">Go to Dashboard</Button>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-4">Redirecting in 3 seconds...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
