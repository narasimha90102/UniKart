import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera, Image as ImageIcon, Info, DollarSign, Tag, FileText, X, CheckCircle2, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../utils/api';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../context/AuthContext';

export function Sell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [categories] = useCategories();
  const [images, setImages] = useState([]);

  const [myProducts, setMyProducts] = useState([]);
  const [fetching, setFetching] = useState(true);

  const fetchMyProducts = async () => {
    if (!user?._id) return;
    try {
      setFetching(true);
      const res = await api.get(`/products?seller=${user._id}&status=all`);
      setMyProducts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  React.useEffect(() => {
    fetchMyProducts();
    window.addEventListener('products-updated', fetchMyProducts);
    return () => window.removeEventListener('products-updated', fetchMyProducts);
  }, [user?._id]);

  // Always start at top of page when navigating to Sell
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const activeProducts = myProducts.filter(p => p.status === 'active');
  const soldProducts = myProducts.filter(p => p.status === 'sold');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    condition: '',
    description: '',
    reason: '',
  });

  const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/webp', quality));
      };
      img.onerror = (err) => reject(err);
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setLoading(true);
    try {
      const compressedUrls = await Promise.all(
        files.map(file => compressImage(file))
      );
      setImages(prev => [...prev, ...compressedUrls]);
    } catch (err) {
      console.error('Failed to compress image:', err);
      alert('Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      showToast('Please upload at least one image', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/products/create', {
        ...formData,
        images: images,
        price: Number(formData.price)
      });
      showToast('Product listed successfully!', 'success');
      window.dispatchEvent(new Event('products-updated'));
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to list product';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] p-5 md:p-8 shadow-xl shadow-gray-200/40 border border-gray-100"
      >
        <div className="mb-5 text-center">
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-1 tracking-tighter">Sell Your Gear</h1>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Post your item to the campus marketplace in seconds.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Images Section */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Images (Max 5)</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <AnimatePresence>
                {images.map((img, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-square rounded-[2rem] overflow-hidden border-2 border-primary/20 shadow-sm group"
                  >
                    <img src={img} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 p-1.5 bg-white/95 rounded-full text-red-500 shadow-md md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 active:scale-90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {images.length < 5 && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-[2rem] border-2 border-dashed border-gray-100 bg-gray-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-primary/20 transition-all group"
                >
                  <Camera className="w-8 h-8 text-gray-300 group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-tighter">Add Photo</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              hidden 
              multiple 
              accept="image/*" 
              onChange={handleImageChange} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Item Title</label>
              <Input 
                required 
                className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 text-sm font-bold"
                placeholder="What are you selling?"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (INR)</label>
              <div className="relative">
                <Input 
                  type="number" 
                  required 
                  className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 text-sm font-bold pl-12"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                required
                className="w-full h-14 px-4 rounded-2xl border-gray-100 bg-gray-50/50 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Item Condition</label>
              <select 
                required
                className="w-full h-14 px-4 rounded-2xl border-gray-100 bg-gray-50/50 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
              >
                <option value="">Select Condition</option>
                <option value="New">Brand New</option>
                <option value="Like New">Like New / Mint</option>
                <option value="Used - Good">Used - Good</option>
                <option value="Used - Fair">Used - Fair</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Description</label>
            <textarea 
              required
              rows="4"
              className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              placeholder="Describe the item (brand, age, flaws...)"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <AnimatePresence>
            {formData.condition && formData.condition !== 'New' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Info className="w-3 h-3" /> Reason for Selling (Required for Used Items)
                </label>
                <textarea 
                  required
                  rows="2"
                  className="w-full p-4 rounded-2xl border border-orange-100 bg-orange-50/30 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-200 transition-all resize-none"
                  placeholder="Tell buyers why you are selling this item... (e.g., Graduating, Upgraded, No longer needed)"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button type="button" variant="ghost" className="w-full sm:w-auto h-14 px-10 rounded-2xl font-bold" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={loading} className="w-full sm:w-auto h-14 px-12 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
              List Product Now
            </Button>
          </div>
        </form>
      </motion.div>

      {/* NEW: My Listings / Sold Items Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-5 space-y-4"
      >
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Marketplace Management</h2>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg border border-emerald-100">Tracking Active</span>
            <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-black uppercase rounded-lg border border-gray-100">Tracking Sold</span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-5 md:p-8 border border-gray-100 shadow-xl shadow-gray-200/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
            {/* Active Items */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Listings ({activeProducts.length})</h3>
              </div>
              
              <div className="space-y-4">
                {activeProducts.length > 0 ? (
                  activeProducts.map((p, i) => (
                    <div key={p._id || i} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-3xl border border-transparent hover:border-primary/20 transition-all group">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="w-6 h-6" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-800 truncate">{p.title}</p>
                        <p className="text-xs font-bold text-emerald-600 mt-0.5">₹{p.price} • Active</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-xl font-bold text-[10px] h-8 bg-primary/10 text-primary hover:bg-primary/20"
                          onClick={async () => {
                            if (window.confirm('Mark this item as sold?')) {
                              try {
                                await api.put(`/products/${p._id}`, { status: 'sold' });
                                fetchMyProducts();
                              } catch (err) {
                                alert('Failed to update status');
                              }
                            }
                          }}
                        >
                          Mark Sold
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-xl font-bold text-[10px] h-8 bg-blue-50 text-blue-600 hover:bg-blue-100" onClick={() => navigate('/dashboard/chat')}>
                          <MessageCircle className="w-3 h-3 mr-1" /> Messages
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-center text-gray-400 font-bold py-4 bg-gray-50/30 rounded-2xl border-2 border-dashed border-gray-100">You have 0 other active listings</p>
                )}
              </div>
            </div>

            {/* Sold Items */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Successfully Sold ({soldProducts.length})</h3>
              </div>

              <div className="space-y-4">
                {soldProducts.length > 0 ? (
                  soldProducts.map((p, i) => (
                    <div key={p._id || i} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-3xl border border-transparent opacity-75">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden shrink-0 grayscale">
                        <img src={p.images?.[0]} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-400 truncate line-through">{p.title}</p>
                        <p className="text-xs font-bold text-primary mt-0.5 uppercase tracking-widest">Sold for ₹{p.price}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-gray-50/30 rounded-[2rem] border-2 border-dashed border-gray-100">
                    <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">No sold items yet</p>
                    <p className="text-[10px] text-gray-300 mt-1">Items you mark as 'Sold' will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-100 text-emerald-800'
                : 'bg-red-50/95 border-red-100 text-red-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-red-500 shrink-0" />
            )}
            <p className="text-sm font-bold leading-tight">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors ml-2"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
