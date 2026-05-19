import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Plus, Edit3, Trash2, Home, Building2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

const EMPTY_ADDRESS = { label: '', name: '', phone: '', line1: '', line2: '', city: '', pincode: '', type: 'home' };

function AddressForm({ initial = EMPTY_ADDRESS, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) e.phone = 'Valid 10-digit phone required';
    if (!form.line1.trim()) e.line1 = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode.trim())) e.pincode = 'Valid 6-digit pincode required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const Field = ({ label, field, placeholder, type = 'text' }) => (
    <div className="space-y-1">
      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <input type={type} value={form[field]} onChange={set(field)} placeholder={placeholder}
        className={`w-full h-12 px-4 rounded-xl border-2 text-sm font-bold text-gray-900 placeholder-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-white transition-all ${errors[field] ? 'border-red-200' : 'border-gray-100'}`} />
      {errors[field] && <p className="text-[9px] text-red-500 font-bold ml-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {['home', 'hostel', 'other'].map(t => (
          <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
            className={`flex-1 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${form.type === t ? 'border-primary bg-primary text-white' : 'border-gray-100 text-gray-500 hover:border-primary/30'}`}>
            {t}
          </button>
        ))}
      </div>
      <Field label="Full Name" field="name" placeholder="Delivery recipient name" />
      <Field label="Phone Number" field="phone" placeholder="10-digit mobile number" />
      <Field label="Address Line 1" field="line1" placeholder="Flat/Room No., Building, Street" />
      <Field label="Address Line 2 (Optional)" field="line2" placeholder="Hostel name, landmark, etc." />
      <div className="grid grid-cols-2 gap-3">
        <Field label="City / Campus" field="city" placeholder="e.g. Coimbatore" />
        <Field label="Pincode" field="pincode" placeholder="6-digit pincode" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 h-12 rounded-2xl border-2 border-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest hover:bg-gray-50">Cancel</button>
        <button type="button" onClick={() => validate() && onSave(form)} className="flex-1 h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 shadow-xl shadow-primary/20">Save Address</button>
      </div>
    </div>
  );
}

export function AddressModal({ onClose }) {
  const { user, setUser } = useAuth();
  const [addresses, setAddresses] = useState(user?.addresses || [
    { id: '1', type: 'hostel', name: user?.name || 'Student', phone: user?.phoneNumber || '', line1: 'Room 204, Block A', line2: '', city: 'Coimbatore', pincode: '641004', isDefault: true },
  ]);
  const [view, setView] = useState('list'); // list | add | edit
  const [editTarget, setEditTarget] = useState(null);

  const persist = (updated) => {
    setAddresses(updated);
    const u = { ...user, addresses: updated };
    setUser(u);
    localStorage.setItem('unikart_user', JSON.stringify(u));
  };

  const addAddress = (form) => {
    persist([...addresses, { ...form, id: Date.now().toString(), isDefault: addresses.length === 0 }]);
    setView('list');
  };

  const editAddress = (form) => {
    persist(addresses.map(a => a.id === editTarget.id ? { ...a, ...form } : a));
    setView('list');
    setEditTarget(null);
  };

  const deleteAddress = (id) => persist(addresses.filter(a => a.id !== id));

  const setDefault = (id) => persist(addresses.map(a => ({ ...a, isDefault: a.id === id })));

  const TypeIcon = ({ type }) => type === 'home' ? <Home className="w-4 h-4" /> : type === 'hostel' ? <Building2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
          className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={view === 'list' ? onClose : undefined} />
        <motion.div variants={panelVariants} initial="hidden" animate="visible" exit="exit"
          className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto no-scrollbar">

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <MapPin className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tighter">Addresses</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  {view === 'list' ? `${addresses.length} saved` : view === 'add' ? 'Add new address' : 'Edit address'}
                </p>
              </div>
            </div>
            <button onClick={view === 'list' ? onClose : () => { setView('list'); setEditTarget(null); }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {view === 'list' && (
            <>
              <div className="space-y-3 mb-4">
                <AnimatePresence>
                  {addresses.map(addr => (
                    <motion.div key={addr.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                      className={`p-4 rounded-2xl border-2 ${addr.isDefault ? 'border-primary bg-primary/5' : 'border-gray-100'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${addr.isDefault ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                            <TypeIcon type={addr.type} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-black text-gray-900">{addr.name}</p>
                              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${addr.isDefault ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {addr.isDefault ? 'Default' : addr.type}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 font-bold mt-0.5">{addr.line1}{addr.line2 && `, ${addr.line2}`}</p>
                            <p className="text-[10px] text-gray-400 font-bold">{addr.city} – {addr.pincode} &nbsp;·&nbsp; {addr.phone}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => { setEditTarget(addr); setView('edit'); }} className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-colors">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteAddress(addr.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {!addr.isDefault && (
                        <button onClick={() => setDefault(addr.id)} className="mt-3 w-full h-8 rounded-xl border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary/5 transition-colors">
                          Set as Default
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <button onClick={() => setView('add')}
                className="w-full h-12 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 mb-3">
                <Plus className="w-4 h-4" /> Add New Address
              </button>
              <button onClick={onClose} className="w-full h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all">
                Done
              </button>
            </>
          )}

          {view === 'add' && <AddressForm onSave={addAddress} onCancel={() => setView('list')} />}
          {view === 'edit' && editTarget && <AddressForm initial={editTarget} onSave={editAddress} onCancel={() => { setView('list'); setEditTarget(null); }} />}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
