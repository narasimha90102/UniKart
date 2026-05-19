import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, ShoppingBag, MessageCircle, Tag, Star, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${value ? 'bg-primary' : 'bg-gray-200'}`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md ${value ? 'left-6' : 'left-0.5'}`}
      />
    </button>
  );
}

export function NotificationModal({ onClose }) {
  const { user, setUser } = useAuth();
  const defaultPrefs = user?.notifPrefs || {
    messages: true,
    orders: true,
    deals: true,
    reviews: true,
    pushEnabled: true,
    emailDigest: false,
  };
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (key) => (val) => setPrefs(p => ({ ...p, [key]: val }));

  const items = [
    { key: 'messages', label: 'New Messages', desc: 'When someone sends you a message', icon: MessageCircle },
    { key: 'orders', label: 'Order Updates', desc: 'Status changes for your purchases', icon: ShoppingBag },
    { key: 'deals', label: 'Deals & Offers', desc: 'Price drops on items you like', icon: Tag },
    { key: 'reviews', label: 'Reviews & Ratings', desc: 'When buyers rate your products', icon: Star },
    { key: 'pushEnabled', label: 'Push Notifications', desc: 'Browser & mobile alerts', icon: Bell },
    { key: 'emailDigest', label: 'Weekly Email Digest', desc: 'Summary of activity each week', icon: Bell },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/users/notifications', { notifPrefs: prefs });
    } catch {}
    // Always persist locally
    const updated = { ...user, notifPrefs: prefs };
    setUser(updated);
    localStorage.setItem('unikart_user', JSON.stringify(updated));
    setSaved(true);
    setTimeout(onClose, 1800);
    setSaving(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
          className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
        <motion.div variants={panelVariants} initial="hidden" animate="visible" exit="exit"
          className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative z-10">

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Bell className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tighter">Notifications</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Manage your alerts</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {saved ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tighter mb-2">Preferences Saved!</h3>
              <p className="text-sm text-gray-500 font-bold">Notification settings updated.</p>
            </motion.div>
          ) : (
            <>
              <div className="space-y-1 mb-8">
                {items.map(({ key, label, desc, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">{label}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{desc}</p>
                      </div>
                    </div>
                    <Toggle value={prefs[key]} onChange={update(key)} />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={onClose}
                  className="flex-1 h-12 rounded-2xl border-2 border-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Save</>}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
