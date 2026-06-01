import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ShoppingBag, Activity, Plus, X, List, 
  ChevronDown, ChevronUp, History, MessageSquare, 
  Reply, ShieldAlert, Trash2, Edit, Save, LogOut, Settings, CheckCircle, Search, Mail as MailIcon, Hash, GraduationCap, BookOpen, Clock
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

function StudentAvatar({ name, avatar }) {
  const [error, setError] = useState(false);
  const initials = name ? name.charAt(0).toUpperCase() : '?';

  if (!avatar || avatar === 'default-avatar.png' || error) {
    return (
      <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white font-black flex items-center justify-center text-2xl uppercase select-none shrink-0 shadow-sm border border-emerald-100">
        {initials}
      </div>
    );
  }

  const src = avatar.startsWith('http') ? avatar : `/uploads/${avatar}`;

  return (
    <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner border border-gray-100">
      <img 
        src={src} 
        alt={name} 
        onError={() => setError(true)} 
        className="w-full h-full object-cover" 
      />
    </div>
  );
}

export function AdminPanel() {
  const { user: currentUser, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);
  const [activeTab, setActiveTab] = useState('console');
  const [verificationTab, setVerificationTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Modal States
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'user', status: 'approved', regNo: '', college: '', department: '' });
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ title: '', price: '', category: '', status: 'active', images: '' });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, productsRes, categoriesRes, historyRes, supportRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/products'),
        api.get('/products/categories'),
        api.get('/admin/login-history'),
        api.get('/admin/support')
      ]);

      setUsers(usersRes.data.data || []);
      setListings(productsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
      setLoginHistory(historyRes.data.data || []);
      setSupportRequests(supportRes.data.data || []);
      setLastSynced(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to connect to system hub.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-sync database listings and dashboard stats every 30 seconds
    const syncInterval = setInterval(() => {
      console.log('[AdminPanel] Auto-syncing database hub...');
      fetchData();
    }, 30000);

    return () => clearInterval(syncInterval);
  }, []);

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    console.log('[AdminPanel] Submitting user form:', userForm);
    try {
      if (editingUser) {
        const res = await api.put(`/admin/users/${editingUser._id}`, userForm);
        console.log('[AdminPanel] User updated successfully:', res.data);
        setUsers(users.map(u => u._id === editingUser._id ? res.data.data : u));
        showToast('System user updated successfully.', 'success');
      } else {
        const res = await api.post('/admin/users', userForm);
        console.log('[AdminPanel] User created successfully:', res.data);
        setUsers([res.data.data, ...users]);
        showToast('System user created successfully in Database.', 'success');
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
    } catch (err) { 
      console.error('[AdminPanel] Form submission failed:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Operation failed';
      showToast(errMsg, 'error');
    }
  };

  const handleUserDelete = async (id) => {
    if (!window.confirm('Delete this user permanently? All their listings will also be removed.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      showToast('User and associated listings deleted successfully.', 'success');
    } catch (err) { 
      console.error('[AdminPanel] Delete user failed:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Delete failed';
      showToast(errMsg, 'error');
    }
  };

  const handleListingDelete = async (id) => {
    if (!window.confirm('Remove this listing?')) return;
    try {
      await api.delete(`/products/${id}`);
      setListings(listings.filter(l => l._id !== id));
      showToast('Product listing removed successfully.', 'success');
    } catch (err) { 
      console.error('[AdminPanel] Delete listing failed:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Delete failed';
      showToast(errMsg, 'error');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, productForm);
        
        // If the admin sets status to 'sold', remove it from active listings instantly
        if (productForm.status === 'sold') {
          setListings(listings.filter(l => l._id !== editingProduct._id));
          showToast('Product marked as sold and removed from active overview.', 'success');
        } else {
          setListings(listings.map(l => l._id === editingProduct._id ? { ...l, ...productForm } : l));
          showToast('Listing updated successfully.', 'success');
        }
      } else {
        const res = await api.post('/products', {
          ...productForm,
          images: [productForm.images || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
          description: 'Platform listing.',
          condition: 'New'
        });
        setListings([res.data.data, ...listings]);
        showToast('Listing created successfully.', 'success');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (err) { 
      console.error('[AdminPanel] Product submit failed:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Operation failed';
      showToast(errMsg, 'error');
    }
  };

  const handleVerification = async (id, status) => {
    try {
      const res = await api.put(`/admin/verifications/${id}`, { status });
      if (res.data.success) {
        setUsers(users.map(u => u._id === id ? res.data.data : u));
        showToast(`User registration ${status} successfully.`, 'success');
      }
    } catch (err) {
      console.error('[AdminPanel] Verification failed:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Verification update failed';
      showToast(errMsg, 'error');
    }
  };

  const handleSupportResponse = async () => {
    try {
      await api.put(`/admin/support/${selectedRequest._id}`, { response: adminResponse });
      setSupportRequests(supportRequests.map(req => 
        req._id === selectedRequest._id ? { ...req, adminResponse, status: 'replied' } : req
      ));
      setIsResponseModalOpen(false);
      setAdminResponse('');
      showToast('Support desk reply dispatched successfully.', 'success');
    } catch (err) { 
      console.error('[AdminPanel] Support response failed:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Response failed';
      showToast(errMsg, 'error');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products/categories', { name: categoryName });
      setCategories([...categories, categoryName]);
      setIsCategoryModalOpen(false);
      setCategoryName('');
      showToast('Category created successfully.', 'success');
    } catch (err) { 
      console.error('[AdminPanel] Category submit failed:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Category error';
      showToast(errMsg, 'error');
    }
  };

  const handleCategoryDelete = async (name) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await api.delete(`/products/categories/${name}`);
      setCategories(categories.filter(c => c !== name));
      showToast('Category deleted successfully.', 'success');
    } catch (err) { 
      console.error('[AdminPanel] Category delete failed:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Delete failed';
      showToast(errMsg, 'error');
    }
  };

  if (loading && !lastSynced) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Activity className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <p className="text-xl font-black text-gray-900">Synchronizing Hub...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-xl shadow-gray-200/40 sticky top-28">
            <div className="flex items-center gap-3 px-3 mb-8">
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">A</div>
              <div>
                <p className="text-sm font-black text-gray-900">Admin Control</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Root System</p>
              </div>
            </div>

            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('console')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-black text-sm ${
                  activeTab === 'console' ? 'bg-primary text-white shadow-xl shadow-primary/25' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Activity className="w-4 h-4" /> Console
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-black text-sm ${
                  activeTab === 'users' ? 'bg-primary text-white shadow-xl shadow-primary/25' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Users className="w-4 h-4" /> User Base
              </button>
              <button 
                onClick={() => setActiveTab('verifications')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-black text-sm ${
                  activeTab === 'verifications' ? 'bg-primary text-white shadow-xl shadow-primary/25' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <CheckCircle className="w-4 h-4" /> Verifications
              </button>
            </nav>

            <div className="mt-10 pt-6 border-t border-gray-50">
              <button 
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-bold text-sm"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-sm font-bold flex items-center gap-3">
              <ShieldAlert className="w-5 h-5" /> {error}
              <button onClick={fetchData} className="ml-auto underline">Retry</button>
            </div>
          )}
          {activeTab === 'console' && (
            <div className="space-y-10">
              {/* Top Bar */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tighter">System Hub</h1>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Database Live: {lastSynced}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="rounded-2xl border-gray-200 hover:bg-white" onClick={fetchData}>Force Update</Button>
              </div>

              {error && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-[2.5rem] flex items-center gap-4 text-red-600">
                  <ShieldAlert className="w-8 h-8" />
                  <p className="text-sm font-bold">{error}</p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Users', val: users.length, icon: Users, bg: 'bg-blue-50', text: 'text-blue-600' },
                  { label: 'Items', val: listings.length, icon: ShoppingBag, bg: 'bg-emerald-50', text: 'text-emerald-600' },
                  { label: 'Logs', val: loginHistory.length, icon: History, bg: 'bg-purple-50', text: 'text-purple-600' },
                  { label: 'Support', val: supportRequests.length, icon: MessageSquare, bg: 'bg-pink-50', text: 'text-pink-600' }
                ].map((s, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 ${s.bg} ${s.text} rounded-xl flex items-center justify-center mb-4`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                    <p className="text-2xl font-black text-gray-900">{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Main Management Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Users & Categories */}
                <div className="lg:col-span-4 space-y-8">
                  {/* Category Manager */}
                  <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                      <h2 className="font-black text-gray-800 flex items-center gap-2 text-xs uppercase tracking-widest"><List className="w-4 h-4" /> Categories</h2>
                      <button onClick={() => { setCategoryName(''); setIsCategoryModalOpen(true); }} className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                    <div className="p-4 space-y-2">
                      {categories.map((cat, i) => {
                        const items = listings.filter(l => l.category === cat);
                        const open = expandedCategory === cat;
                        return (
                          <div key={i}>
                            <div 
                              onClick={() => setExpandedCategory(open ? null : cat)}
                              className={`flex justify-between items-center p-4 rounded-2xl cursor-pointer border transition-all ${open ? 'bg-primary text-white border-primary' : 'bg-gray-50/50 border-transparent hover:border-gray-200'}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${open ? 'bg-white/20' : 'bg-gray-100'}`}>{items.length}</span>
                                <span className="text-sm font-black">{cat}</span>
                              </div>
                              <Trash2 className="w-4 h-4 opacity-50 hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleCategoryDelete(cat); }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Side: Listings & Support */}
                <div className="lg:col-span-8 space-y-8">
                  {/* Listings Table */}
                  <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                      <h2 className="font-black text-gray-800 flex items-center gap-2 text-xs uppercase tracking-widest">
                        <ShoppingBag className="w-4 h-4" /> 
                        Marketplace Oversight
                        {loading && (
                          <svg className="animate-spin h-3.5 w-3.5 text-primary ml-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                      </h2>
                      <Button size="sm" className="rounded-xl px-5" onClick={() => { setEditingProduct(null); setProductForm({ title: '', price: '', category: categories[0] || 'Others', status: 'available', images: '' }); setIsProductModalOpen(true); }}>Create Listing</Button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          <tr>
                            <th className="px-6 py-4 text-left">Product</th>
                            <th className="px-6 py-4 text-left">Price & Category</th>
                            <th className="px-6 py-4 text-left">Seller</th>
                            <th className="px-6 py-4 text-left">Date Added</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {listings.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-bold">
                                <div className="flex flex-col items-center justify-center gap-2 py-4">
                                  <ShoppingBag className="w-8 h-8 text-gray-300" />
                                  <p className="text-sm font-black text-gray-400 uppercase tracking-wider">No active marketplace items available</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            listings.map(item => (
                              <tr key={item._id} className="hover:bg-gray-50/30 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <img src={item.images?.[0]} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-gray-100" />
                                    <p className="text-sm font-black text-gray-800">{item.title}</p>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-xs font-black text-emerald-600">
                                  ₹{item.price} • <span className="text-gray-400 uppercase text-[10px] mr-2">{item.category}</span>
                                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">Available</span>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-xs font-black text-gray-800">{item.seller?.name || 'Unknown Seller'}</p>
                                  <p className="text-[10px] font-bold text-gray-400">{item.seller?.email || 'N/A'}</p>
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-gray-500">
                                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => { setEditingProduct(item); setProductForm({ title: item.title, price: item.price, category: item.category, status: item.status }); setIsProductModalOpen(true); }} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleListingDelete(item._id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Support Hub */}
                  <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                      <h2 className="font-black text-gray-800 flex items-center gap-2 text-xs uppercase tracking-widest"><MessageSquare className="w-4 h-4" /> Support Desk</h2>
                    </div>
                    <div className="p-6 space-y-6">
                      {supportRequests.map(req => (
                        <div key={req._id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 relative group">
                          <div className="flex justify-between items-start mb-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{req.subject}</p>
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${req.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>{req.status}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4 font-medium leading-relaxed">"{req.message}"</p>
                          {req.adminResponse ? (
                            <div className="text-[11px] font-bold text-emerald-600 bg-emerald-100/50 p-4 rounded-2xl flex items-center gap-2"><Reply className="w-3.5 h-3.5" /> {req.adminResponse}</div>
                          ) : (
                            <Button size="sm" className="rounded-xl px-5" onClick={() => { setSelectedRequest(req); setIsResponseModalOpen(true); }}>Respond</Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tighter">User Directory</h1>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Full access to account management and system roles</p>
                </div>
                <Button size="sm" className="rounded-xl px-6" onClick={() => { 
                  setEditingUser(null); 
                  setUserForm({ 
                    name: '', 
                    email: '', 
                    password: '', 
                    role: 'user', 
                    status: 'approved',
                    regNo: '',
                    college: '',
                    department: ''
                  }); 
                  setIsUserModalOpen(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" /> Add System User
                </Button>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                      <tr>
                        <th className="px-8 py-5 text-left">Identity</th>
                        <th className="px-6 py-5 text-left">Account Details</th>
                        <th className="px-6 py-5 text-left">Status</th>
                        <th className="px-8 py-5 text-right">Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map(u => (
                        <tr key={u._id} className="hover:bg-gray-50/30 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg shadow-sm border border-blue-100/50">
                                {u.name?.[0]}
                              </div>
                              <div>
                                <p className="text-sm font-black text-gray-900 leading-none">{u.name}</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-1.5 uppercase tracking-widest">{u._id.slice(-6)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm font-bold text-gray-600">{u.email}</p>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${u.status === 'active' || u.status === 'approved' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${u.status === 'active' || u.status === 'approved' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {u.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => { 
                                  setEditingUser(u); 
                                  setUserForm({ 
                                    name: u.name || '', 
                                    email: u.email || '', 
                                    role: u.role || 'user', 
                                    status: u.status || 'approved', 
                                    password: '',
                                    regNo: u.regNo || '',
                                    college: u.college || '',
                                    department: u.department || ''
                                  }); 
                                  setIsUserModalOpen(true); 
                                }}
                                className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleUserDelete(u._id)}
                                className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verifications' && (
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Student Verifications</h1>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                    Manage student access and identity validation
                  </p>
                </div>
                <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                  {[
                    { id: 'pending', label: 'Pending' },
                    { id: 'approved', label: 'Approved' },
                    { id: 'rejected', label: 'Rejected' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setVerificationTab(tab.id)}
                      className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
                        verificationTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Register Number or Email..."
                  className="w-full pl-12 pr-4 h-14 bg-white rounded-3xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-primary/10 outline-none font-bold text-gray-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Verification List */}
              <div className="grid grid-cols-1 gap-6">
                {users
                  .filter(u => {
                    const matchesStatus = 
                      verificationTab === 'pending' ? u.status === 'pending_approval' :
                      verificationTab === 'approved' ? u.status === 'approved' :
                      verificationTab === 'rejected' ? u.status === 'rejected' : false;
                    
                    const matchesSearch = 
                      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      u.regNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      u.name?.toLowerCase().includes(searchQuery.toLowerCase());

                    return matchesStatus && matchesSearch;
                  })
                  .map(u => (
                    <motion.div 
                      key={u._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-5 text-center md:text-left w-full min-w-0">
                          <StudentAvatar name={u.name} avatar={u.avatar} />
                          <div className="space-y-1.5 md:space-y-1 min-w-0 flex-1 w-full">
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-tight truncate w-full" title={u.name}>
                              {u.name}
                            </h3>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 pt-1">
                              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                <MailIcon className="w-3.5 h-3.5 shrink-0" /> {u.email}
                              </span>
                              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                <Hash className="w-3.5 h-3.5 shrink-0" /> {u.regNo}
                              </span>
                              <span className="flex items-center gap-1.5 text-xs font-bold shrink-0">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  u.signupMethod === 'google' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-500 border border-gray-100'
                                }`}>
                                  {u.signupMethod === 'google' ? 'Google' : 'Email'}
                                </span>
                              </span>
                              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 shrink-0">
                                <Clock className="w-3.5 h-3.5 shrink-0" /> Registered: {new Date(u.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {u.verifiedAt && (
                              <span className="flex items-center justify-center md:justify-start gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest pt-2">
                                <Clock className="w-3 h-3 shrink-0" /> {u.status === 'approved' ? 'Approved' : 'Actioned'} on {new Date(u.verifiedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-center">
                          {u.status === 'pending_approval' ? (
                            <>
                              <button 
                                onClick={() => handleVerification(u._id, 'rejected')}
                                className="flex-1 md:flex-none px-6 h-11 rounded-xl bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-colors"
                              >
                                Reject
                              </button>
                              <button 
                                onClick={() => handleVerification(u._id, 'approved')}
                                className="flex-1 md:flex-none px-8 h-11 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                              >
                                Approve
                              </button>
                            </>
                          ) : (
                            <div className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                              u.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                            }`}>
                              {u.status}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                
                {users.filter(u => {
                    const matchesStatus = 
                      verificationTab === 'pending' ? u.status === 'pending_approval' :
                      verificationTab === 'approved' ? u.status === 'approved' :
                      verificationTab === 'rejected' ? u.status === 'rejected' : false;
                    return matchesStatus;
                  }).length === 0 && (
                  <div className="py-20 text-center">
                    <CheckCircle className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold">No {verificationTab} requests found.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab !== 'console' && activeTab !== 'verifications' && activeTab !== 'users' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-xl shadow-gray-200/50">
                <h2 className="text-3xl font-black text-gray-900 mb-10 tracking-tight">System Configuration</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Platform Admin</h3>
                    <div className="space-y-5">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1 block mb-2">Display Name</label>
                        <Input value={currentUser?.name} readOnly className="rounded-[1.25rem] h-14 bg-gray-50 border-transparent font-bold" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1 block mb-2">Auth Email</label>
                        <Input value={currentUser?.email} readOnly className="rounded-[1.25rem] h-14 bg-gray-50 border-transparent font-bold" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Core System Controls</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Marketplace Lock', d: 'Suspend all buying/selling' },
                        { label: 'Auto-Moderator', d: 'Filter listings using AI' },
                        { label: 'Live Verification', d: 'Requires manual listing approval' }
                      ].map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[1.5rem] hover:border-primary/30 transition-all cursor-pointer">
                          <div>
                            <p className="text-sm font-black text-gray-900">{c.label}</p>
                            <p className="text-[10px] font-medium text-gray-400">{c.d}</p>
                          </div>
                          <div className={`w-10 h-6 rounded-full relative ${i === 1 ? 'bg-primary' : 'bg-gray-100'}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full shadow-sm ${i === 1 ? 'right-1 bg-white' : 'left-1 bg-gray-300'}`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[999] w-full max-w-md px-4"
          >
            <div className={`flex items-center gap-3 p-4 rounded-2xl border shadow-xl ${
              toast.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                : 'bg-red-50 border-red-100 text-red-800'
            }`}>
              <ShieldAlert className={`w-5 h-5 shrink-0 ${toast.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`} />
              <p className="text-xs font-black leading-tight flex-1">{toast.message}</p>
              <button onClick={() => setToast(null)} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl border border-gray-100">
              <h3 className="text-2xl font-black text-gray-900 mb-8">{editingUser ? 'Update User' : 'Add New User'}</h3>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Full Name</label>
                  <Input value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} placeholder="Name" required className="h-12 rounded-2xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Email Address</label>
                    <Input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} placeholder="Email" required className="h-12 rounded-2xl" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Register Number (Required)</label>
                    <Input value={userForm.regNo} onChange={e => setUserForm({...userForm, regNo: e.target.value})} placeholder="192311111" required className="h-12 rounded-2xl" />
                  </div>
                </div>
                {!editingUser && (
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Initial Password (min 8 chars)</label>
                    <Input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} placeholder="Password" required className="h-12 rounded-2xl" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">System Role</label>
                    <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full h-12 rounded-2xl bg-gray-50 border border-gray-100 px-4 text-sm font-bold outline-none">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Account Status</label>
                    <select value={userForm.status} onChange={e => setUserForm({...userForm, status: e.target.value})} className="w-full h-12 rounded-2xl bg-gray-50 border border-gray-100 px-4 text-sm font-bold outline-none">
                      <option value="approved">Approved</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 h-14 rounded-2xl">{editingUser ? 'Save Changes' : 'Create Account'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-gray-100">
              <h3 className="text-2xl font-black text-gray-900 mb-8">{editingProduct ? 'Update Item' : 'New System Entry'}</h3>
              <form onSubmit={handleProductSubmit} className="space-y-6">
                <Input value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} placeholder="Title" required className="h-14 rounded-2xl" />
                <Input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} placeholder="Price (INR)" required className="h-14 rounded-2xl" />
                <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full h-14 rounded-2xl bg-gray-50 border-gray-100 px-5 text-sm font-bold">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 h-14 rounded-2xl">Finalize</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isResponseModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl">
              <h3 className="text-xl font-black mb-6">Official Hub Response</h3>
              <textarea 
                className="w-full h-40 bg-gray-50 rounded-[2rem] p-6 outline-none focus:ring-2 focus:ring-primary/10 border border-gray-100 font-medium"
                placeholder="Compose response..."
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
              />
              <Button className="w-full h-14 rounded-2xl mt-6 shadow-lg shadow-primary/20" onClick={handleSupportResponse}>Dispatch Message</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
              <h3 className="text-xl font-black mb-6">Create Hub Category</h3>
              <Input value={categoryName} onChange={e => setCategoryName(e.target.value)} placeholder="Name" required className="h-14 rounded-2xl" />
              <div className="flex gap-4 mt-8">
                <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setIsCategoryModalOpen(false)}>Abort</Button>
                <Button className="flex-1 h-14 rounded-2xl" onClick={handleCategorySubmit}>Create</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
