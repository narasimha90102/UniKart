import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ShoppingBag, DollarSign, Activity, Plus, X, List, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';

export function AdminPanel() {
  const [categories, saveCategories] = useCategories();
  const [products, saveProducts] = useProducts();
  const listings = products;
  const setListings = saveProducts;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    seller: 'Admin User',
    status: 'Active',
    image: '',
    description: '',
    condition: 'New',
    location: ''
  });

  // Categories State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '' });

  // Users State
  const [users, setUsers] = useState([
    { id: 1, name: 'Sarah Connor', email: 'sarah@example.com', status: 'Active', role: 'Seller', date: '2 days ago' },
    { id: 2, name: 'John Smith', email: 'john@example.com', status: 'Pending', role: 'Buyer', date: '5 days ago' },
    { id: 3, name: 'Emma Watson', email: 'emma@example.com', status: 'Active', role: 'Buyer', date: '1 week ago' },
    { id: 4, name: 'Michael Jordan', email: 'michael@example.com', status: 'Suspended', role: 'Seller', date: '2 weeks ago' },
  ]);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    status: 'Active',
    role: 'Buyer',
    date: 'Just now'
  });

  // Categories Handlers
  const handleCategoryDelete = (id) => {
    saveCategories(categories.filter(c => c.id !== id));
  };

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryFormData({ name: '' });
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    setCategoryFormData({ ...cat });
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      saveCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...categoryFormData } : c));
    } else {
      saveCategories([...categories, { id: Date.now().toString(), ...categoryFormData }]);
    }
    setIsCategoryModalOpen(false);
  };

  // Listings Handlers
  const handleDelete = (id) => {
    setListings(listings.filter(item => item.id !== id));
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ name: '', price: '', category: 'Electronics', seller: 'Admin User', status: 'Active' });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setListings(listings.map(item => item.id === editingItem.id ? { ...formData, id: item.id } : item));
    } else {
      setListings([{ ...formData, id: Date.now() }, ...listings]);
    }
    setIsModalOpen(false);
  };

  // Users Handlers
  const handleUserDelete = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const openAddUserModal = () => {
    setEditingUser(null);
    setUserFormData({ name: '', email: '', status: 'Active', role: 'Buyer', date: 'Just now' });
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (user) => {
    setEditingUser(user);
    setUserFormData({ ...user });
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...userFormData, id: u.id } : u));
    } else {
      setUsers([{ ...userFormData, id: Date.now() }, ...users]);
    }
    setIsUserModalOpen(false);
  };

  // Generate Report
  const handleGenerateReport = () => {
    const revenue = listings.reduce((sum, item) => sum + parseInt((item.price || 0).toString().replace(/,/g, '')), 0);
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Users', users.length],
      ['Active Listings', listings.length],
      ['Total Revenue (INR)', revenue],
      ['Total Categories', categories.length],
      ['Report Generated At', new Date().toLocaleString()]
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "unikart_admin_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleGenerateReport}>Generate Report</Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Users', value: users.length.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Active Listings', value: listings.length.toString(), icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { title: 'Total Revenue', value: `₹${(listings.reduce((sum, item) => sum + parseInt(item.price.toString().replace(/,/g, '') || 0), 0) / 100000).toFixed(2)}L`, icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { title: 'Total Categories', value: categories.length.toString(), icon: List, color: 'text-pink-500', bg: 'bg-pink-500/10' },
        ].map((metric, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-6 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${metric.bg}`}>
              <metric.icon className={`w-6 h-6 ${metric.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">{metric.title}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Users Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-lg font-semibold">Platform Users</h2>
          <Button size="sm" onClick={openAddUserModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add User
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{user.name}</span>
                      <span className="text-gray-500 text-xs">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border
                      ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        user.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{user.role}</td>
                  <td className="px-6 py-4 text-gray-400">{user.date}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditUserModal(user)} className="text-blue-400 hover:bg-blue-400/10 px-3 py-1">Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleUserDelete(user.id)} className="text-red-400 hover:bg-red-400/10 px-3 py-1">Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Categories Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-lg font-semibold flex items-center gap-2"><List className="w-5 h-5 text-primary" /> Platform Categories</h2>
          <Button size="sm" onClick={openAddCategoryModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Category Name</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 inline-block">
                      {cat.name || 'Unnamed Category'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditCategoryModal(cat)} className="text-blue-400 hover:bg-blue-400/10 px-3 py-1">Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleCategoryDelete(cat.id)} className="text-red-400 hover:bg-red-400/10 px-3 py-1">Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Listings Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5">
          <h2 className="text-lg font-semibold">Platform Listings</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-[#2a2a2a] border border-white/10 text-sm text-white outline-none focus:border-primary"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <Button size="sm" onClick={openAddModal} className="flex items-center gap-2 whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Item</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Seller</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(selectedCategoryFilter === 'All' ? listings : listings.filter(l => l.category === selectedCategoryFilter)).map((item) => (
                <React.Fragment key={item.id}>
                <tr className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                        <img src={item.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=200'} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{item.title || item.name}</span>
                        <span className={`text-xs ${(item.status || 'Active') === 'Active' ? 'text-emerald-400' : 'text-yellow-400'}`}>{item.status || 'Active'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white font-medium">₹{Number((item.price || '').toString().replace(/,/g, '')).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-gray-300">{item.category}</td>
                  <td className="px-6 py-4 text-gray-400">{item.seller}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditModal(item); }} className="text-blue-400 hover:bg-blue-400/10 px-3 py-1">Edit</Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="text-red-400 hover:bg-red-400/10 px-3 py-1">Delete</Button>
                    <Button variant="ghost" size="icon" className="text-gray-400">
                      {expandedItemId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </td>
                </tr>
                {expandedItemId === item.id && (
                  <tr className="bg-black/20">
                    <td colSpan="5" className="px-6 py-6 border-t border-white/5">
                      <div className="flex flex-col sm:flex-row gap-6">
                        <img src={item.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=400'} alt={item.title} className="w-full sm:w-48 h-48 object-cover rounded-xl shadow-lg border border-white/10" />
                        <div className="flex flex-col gap-2 flex-1">
                          <h4 className="text-xl font-bold text-white">{item.title}</h4>
                          <p className="text-gray-400 text-sm leading-relaxed">{item.description || 'No description available for this item.'}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                              <span className="text-gray-500 text-xs block uppercase mb-1">Condition</span>
                              <span className="text-white text-sm font-medium">{item.condition || 'N/A'}</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                              <span className="text-gray-500 text-xs block uppercase mb-1">Location</span>
                              <span className="text-white text-sm font-medium">{item.location || 'N/A'}</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                              <span className="text-gray-500 text-xs block uppercase mb-1">Orig. Price</span>
                              <span className="text-white text-sm font-medium">₹{item.originalPrice ? Number(item.originalPrice).toLocaleString('en-IN') : 'N/A'}</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                              <span className="text-gray-500 text-xs block uppercase mb-1">Rating</span>
                              <span className="text-white text-sm font-medium">{item.rating || 'N/A'} ⭐</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1a1a1a] rounded-2xl shadow-xl border border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Item Title</label>
                    <Input 
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="bg-black/20 border-white/10 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Price (₹)</label>
                    <Input 
                      type="number"
                      required
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="bg-black/20 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Image URL</label>
                  <Input 
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    placeholder="https://images.unsplash.com/..."
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 text-white outline-none focus:border-primary resize-none"
                    placeholder="Enter full product details..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Condition</label>
                    <select 
                      value={formData.condition}
                      onChange={e => setFormData({...formData, condition: e.target.value})}
                      className="w-full h-11 px-3 rounded-xl bg-[#2a2a2a] border border-white/10 text-white outline-none focus:border-primary"
                    >
                      <option value="New">New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Location</label>
                    <Input 
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g. North Campus"
                      className="bg-black/20 border-white/10 text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full h-11 px-3 rounded-xl bg-[#2a2a2a] border border-white/10 text-white outline-none focus:border-primary"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full h-11 px-3 rounded-xl bg-[#2a2a2a] border border-white/10 text-white outline-none focus:border-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingItem ? 'Save Changes' : 'Add Item'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1a1a1a] rounded-2xl shadow-xl border border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Category Name</label>
                  <Input 
                    required
                    value={categoryFormData.name}
                    onChange={e => setCategoryFormData({...categoryFormData, name: e.target.value})}
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsCategoryModalOpen(false)} className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingCategory ? 'Save Changes' : 'Add Category'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Modal */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1a1a1a] rounded-2xl shadow-xl border border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{editingUser ? 'Edit User' : 'Add New User'}</h3>
                <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Full Name</label>
                  <Input 
                    required
                    value={userFormData.name}
                    onChange={e => setUserFormData({...userFormData, name: e.target.value})}
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email Address</label>
                  <Input 
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={e => setUserFormData({...userFormData, email: e.target.value})}
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Role</label>
                  <select 
                    value={userFormData.role}
                    onChange={e => setUserFormData({...userFormData, role: e.target.value})}
                    className="w-full h-11 px-3 rounded-xl bg-[#2a2a2a] border border-white/10 text-white outline-none focus:border-primary"
                  >
                    <option value="Buyer">Buyer</option>
                    <option value="Seller">Seller</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Account Status</label>
                  <select 
                    value={userFormData.status}
                    onChange={e => setUserFormData({...userFormData, status: e.target.value})}
                    className="w-full h-11 px-3 rounded-xl bg-[#2a2a2a] border border-white/10 text-white outline-none focus:border-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsUserModalOpen(false)} className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingUser ? 'Save Changes' : 'Add User'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
