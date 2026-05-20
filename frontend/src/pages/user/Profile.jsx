import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, CheckCircle, Package, Heart, CreditCard, 
  Settings, LogOut, MessageCircle, List, User, 
  MapPin, ShieldCheck, HelpCircle, FileText, 
  ChevronRight, ShoppingBag, PlusCircle, History,
  Bell, Trash2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('overview'); // 'overview' or 'edit'
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, listings: 0 });
  const isAdmin = user?.role === 'admin';
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    department: user?.college || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });

  // Sync state if user context updates
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        department: user.college || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert('Avatar image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, listingsRes] = await Promise.all([
          api.get('/orders/my-orders'),
          api.get(`/products?seller=${user._id}&status=active`)
        ]);
        setStats({
          orders: ordersRes.data.data.length,
          wishlist: user?.wishlist?.length || 0,
          listings: listingsRes.data.data.length
        });
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    if (user?._id) fetchStats();
  }, [user?._id, user?.wishlist]);

  const cleanPhone = (phone) => {
    let clean = (phone || '').replace(/\s+/g, '');
    if (clean.startsWith('+91')) {
      clean = clean.slice(3);
    } else if (clean.startsWith('91') && clean.length === 12) {
      clean = clean.slice(2);
    }
    return clean;
  };

  const isPhoneValid = (phone) => {
    const clean = cleanPhone(phone);
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(clean);
  };

  const isFormValid = 
    formData.name.trim() !== '' &&
    isPhoneValid(formData.phone) &&
    (isAdmin || (formData.department && formData.department.trim() !== ''));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSaving(true);
    setSaveError('');
    try {
      const res = await api.put('/users/profile', {
        name: formData.name,
        phoneNumber: formData.phone,
        college: isAdmin ? undefined : formData.department,
        bio: formData.bio,
        avatar: formData.avatar
      });
      const updatedUser = { ...user, ...res.data.data };
      setUser(updatedUser);
      localStorage.setItem('unikart_user', JSON.stringify(updatedUser));
      setSaveSuccess(true);
      setView('overview');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const AccountSection = ({ title, items }) => (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden mb-6">
      {title && (
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-50">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</h3>
        </div>
      )}
      <div className="divide-y divide-gray-50">
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => item.onClick ? item.onClick() : navigate(item.path)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group text-left"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${item.danger ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-sm font-black ${item.danger ? 'text-red-600' : 'text-gray-900'}`}>{item.label}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.desc}</p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 ${item.danger ? 'text-red-200' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  if (view === 'edit') {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto pb-24 lg:pb-0">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView('overview')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronRight className="w-6 h-6 text-gray-400 rotate-180" />
          </button>
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter">Edit Profile</h1>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl shadow-gray-200/40">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-col items-center gap-6 mb-10">
              <div className="relative group">
                {formData.avatar && formData.avatar !== 'default-avatar.png' ? (
                  <img 
                    src={formData.avatar} 
                    alt="User" 
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/5 transition-all group-hover:brightness-90" 
                  />
                ) : (
                  <div className="default-avatar w-32 h-32 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-5xl uppercase ring-4 ring-primary/5 select-none transition-all group-hover:brightness-90 shadow-inner">
                    {(formData.name || user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-2xl shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-black text-gray-900">{user?.name}</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name *</label>
              <Input
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number *</label>
              <Input
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="+91 xxxxxxxxxx"
                className="h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white"
              />
            </div>
            {!isAdmin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">College/Department *</label>
                <Input
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  className="h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Short Bio</label>
              <textarea
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell other students a bit about yourself..."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-sm font-semibold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-white transition-all resize-none"
              />
            </div>
            
            {saveError && <p className="text-xs font-bold text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">{saveError}</p>}
            
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl font-bold" onClick={() => setView('overview')}>Cancel</Button>
              <Button type="submit" disabled={!isFormValid || isSaving} className="flex-1 h-14 rounded-2xl font-black shadow-xl shadow-primary/20">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto pb-24 lg:pb-0">
      {/* Header Profile Card */}
      <div className="bg-[#1B8C50] rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary/10 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 blur-2xl" />
        
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative">
            {user?.avatar && user.avatar !== 'default-avatar.png' ? (
              <img 
                src={user.avatar} 
                alt="User" 
                className="w-32 h-32 rounded-full object-cover ring-4 ring-white/20" 
              />
            ) : (
              <div className="default-avatar w-32 h-32 rounded-full bg-white text-[#1B8C50] font-black flex items-center justify-center text-5xl uppercase ring-4 ring-white/20 select-none shadow-inner">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            {user?.isVerified && !isAdmin && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-400 rounded-full border-4 border-[#1B8C50] flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight">{user?.name}</h1>
            <p className="text-emerald-100 text-sm font-medium mt-1">{user?.email}</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest">{user?.role || 'Student'}</span>
              {!isAdmin && (
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {user?.isVerified ? 'Verified Campus User' : 'Unverified Account'}
                </span>
              )}
            </div>
          </div>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white hover:text-primary transition-all rounded-2xl px-8 h-12 font-bold mt-2" onClick={() => setView('edit')}>
            Edit Profile
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl border border-emerald-100 mb-6 flex items-center gap-3 font-bold text-sm">
          <CheckCircle className="w-5 h-5" /> Profile updated successfully!
        </motion.div>
      )}

      {/* Profile Details Card */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 p-8 space-y-8">
        <div>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Identity Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
              <p className="text-base font-black text-gray-900">{user?.name}</p>
            </div>
            <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
              <p className="text-base font-black text-gray-900">{user?.email}</p>
            </div>
            <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone Number</p>
              <p className="text-base font-black text-gray-900">{user?.phoneNumber || 'Not provided'}</p>
            </div>
            <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">College / Campus</p>
              <p className="text-base font-black text-gray-900">{user?.college || 'Not set'}</p>
            </div>
          </div>
          {user?.bio && (
            <div className="mt-6 p-5 bg-gray-50 rounded-3xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Short Bio</p>
              <p className="text-sm font-semibold text-gray-700 leading-relaxed">{user.bio}</p>
            </div>
          )}
        </div>

        <div className="pt-8 border-t border-gray-50">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Marketplace Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 text-center">
              <p className="text-2xl font-black text-primary leading-none">{user?.ratings?.average || '0.0'}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase mt-2 tracking-widest">Seller Rating</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5 tracking-tighter">({user?.ratings?.count || 0} reviews)</p>
            </div>
            <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 text-center">
              <p className="text-2xl font-black text-gray-900 leading-none">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
              </p>
              <p className="text-[10px] font-black text-gray-400 uppercase mt-2 tracking-widest">Joined Date</p>
            </div>
            {!isAdmin ? (
              <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 text-center">
                <p className={`text-sm font-black leading-none uppercase tracking-widest mt-1 ${user?.isVerified ? 'text-emerald-500' : 'text-orange-500'}`}>
                  {user?.isVerified ? 'Verified' : 'Pending'}
                </p>
                <p className="text-[10px] font-black text-gray-400 uppercase mt-2 tracking-widest">Verification Status</p>
              </div>
            ) : (
              <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 text-center">
                <p className="text-sm font-black leading-none uppercase tracking-widest mt-1 text-primary">
                  System Admin
                </p>
                <p className="text-[10px] font-black text-gray-400 uppercase mt-2 tracking-widest">Account Type</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-gray-50">
          <Link to="/dashboard/settings">
            <Button variant="outline" className="w-full h-14 rounded-2xl border-gray-100 text-gray-600 font-bold hover:bg-gray-50">
              View Account Settings
            </Button>
          </Link>
        </div>
      </div>

      <div className="text-center py-8">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">UniKart v2.1.0 • Campus Certified</p>
      </div>
    </motion.div>
  );
}
