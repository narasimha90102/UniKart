import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Plus, Trash2, CheckCircle, Smartphone, Building2, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

const METHOD_TYPES = [
  { id: 'upi', label: 'UPI / GPay / PhonePe', icon: Smartphone, color: 'text-green-600 bg-green-50' },
  { id: 'bank', label: 'Bank Account', icon: Building2, color: 'text-blue-600 bg-blue-50' },
  { id: 'wallet', label: 'Digital Wallet', icon: Wallet, color: 'text-purple-600 bg-purple-50' },
];

function AddMethodForm({ onSave, onCancel }) {
  const [type, setType] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (type === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) return setError('Please enter a valid UPI ID (e.g. name@upi)');
    }
    onSave({ type, upiId: type === 'upi' ? upiId : '', id: Date.now().toString() });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Payment Type</label>
        <div className="space-y-2">
          {METHOD_TYPES.map(m => {
            const Icon = m.icon;
            return (
              <button key={m.id} type="button" onClick={() => setType(m.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${type === m.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-sm font-black ${type === m.id ? 'text-primary' : 'text-gray-700'}`}>{m.label}</span>
                {type === m.id && <div className="ml-auto w-5 h-5 bg-primary rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>}
              </button>
            );
          })}
        </div>
      </div>

      {type === 'upi' && (
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">UPI ID</label>
          <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@paytm / @gpay / @phonepe"
            className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-white transition-all" />
          {error && <p className="text-[9px] text-red-500 font-bold ml-1">{error}</p>}
        </div>
      )}

      {type === 'bank' && (
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-wide mb-1">Bank Account Integration</p>
          <p className="text-xs text-blue-700 font-bold">Bank account linking via secure banking gateway coming soon. Use UPI for now.</p>
        </div>
      )}

      {type === 'wallet' && (
        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
          <p className="text-[10px] font-black text-purple-600 uppercase tracking-wide mb-1">Digital Wallets</p>
          <p className="text-xs text-purple-700 font-bold">Paytm, Amazon Pay wallet integration coming soon. Use UPI for instant transfers.</p>
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 h-12 rounded-2xl border-2 border-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest hover:bg-gray-50">Cancel</button>
        <button type="button" onClick={handleSave} className="flex-1 h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 shadow-xl shadow-primary/20">Save</button>
      </div>
    </div>
  );
}

export function PaymentModal({ onClose }) {
  const { user, setUser } = useAuth();
  const [methods, setMethods] = useState(user?.paymentMethods || []);
  const [view, setView] = useState('list'); // list | add

  const persist = (updated) => {
    setMethods(updated);
    const u = { ...user, paymentMethods: updated };
    setUser(u);
    localStorage.setItem('unikart_user', JSON.stringify(u));
  };

  const addMethod = (m) => {
    persist([...methods, { ...m, isDefault: methods.length === 0 }]);
    setView('list');
  };

  const removeMethod = (id) => persist(methods.filter(m => m.id !== id));
  const setDefault = (id) => persist(methods.map(m => ({ ...m, isDefault: m.id === id })));

  const getIcon = (type) => METHOD_TYPES.find(m => m.id === type) || METHOD_TYPES[0];
  const getLabel = (m) => m.type === 'upi' ? m.upiId : m.type === 'bank' ? 'Bank Account' : 'Digital Wallet';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
          className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={view === 'list' ? onClose : undefined} />
        <motion.div variants={panelVariants} initial="hidden" animate="visible" exit="exit"
          className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative z-10">

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tighter">Payment Settings</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{methods.length} method{methods.length !== 1 ? 's' : ''} saved</p>
              </div>
            </div>
            <button onClick={view === 'list' ? onClose : () => setView('list')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {view === 'list' && (
            <>
              {methods.length === 0 ? (
                <div className="text-center py-10 mb-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-black text-gray-400 tracking-tighter">No payment methods</h3>
                  <p className="text-xs text-gray-400 font-bold mt-1">Add your UPI ID for seamless transactions.</p>
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  <AnimatePresence>
                    {methods.map(m => {
                      const meta = getIcon(m.type);
                      const Icon = meta.icon;
                      return (
                        <motion.div key={m.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${m.isDefault ? 'border-primary bg-primary/5' : 'border-gray-100'}`}>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-gray-900 truncate">{getLabel(m)}</p>
                              {m.isDefault && <span className="px-2 py-0.5 bg-primary text-white rounded-lg text-[9px] font-black uppercase flex-shrink-0">Default</span>}
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">{m.type.toUpperCase()}</p>
                          </div>
                          <div className="flex gap-1">
                            {!m.isDefault && <button onClick={() => setDefault(m.id)} className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-colors text-[8px] font-black uppercase">Set default</button>}
                            <button onClick={() => removeMethod(m.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
              <button onClick={() => setView('add')}
                className="w-full h-12 mb-3 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Payment Method
              </button>
              <button onClick={onClose} className="w-full h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all">
                Done
              </button>
            </>
          )}

          {view === 'add' && <AddMethodForm onSave={addMethod} onCancel={() => setView('list')} />}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
