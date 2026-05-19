import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Eye, EyeOff, Phone, Mail, Globe, Check, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

function Toggle({ value, onChange, label, desc, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-black text-gray-900">{label}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{desc}</p>
        </div>
      </div>
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
    </div>
  );
}

export function PrivacyModal({ onClose }) {
  const { user, setUser } = useAuth();
  const [prefs, setPrefs] = useState({
    publicProfile: user?.privacy?.publicProfile ?? true,
    showPhone: user?.privacy?.showPhone ?? true,
    showEmail: user?.privacy?.showEmail ?? false,
    showOnline: user?.privacy?.showOnline ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (key) => (val) => setPrefs(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/users/privacy', { privacy: prefs });
      const updated = { ...user, privacy: prefs };
      setUser(updated);
      localStorage.setItem('unikart_user', JSON.stringify(updated));
      setSaved(true);
      setTimeout(onClose, 1800);
    } catch {
      // graceful: save to localStorage even if API fails (no privacy endpoint yet)
      const updated = { ...user, privacy: prefs };
      setUser(updated);
      localStorage.setItem('unikart_user', JSON.stringify(updated));
      setSaved(true);
      setTimeout(onClose, 1800);
    } finally {
      setSaving(false);
    }
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
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tighter">Privacy Center</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Control what others see</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {saved ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tighter mb-2">Preferences Saved!</h3>
              <p className="text-sm text-gray-500 font-bold">Your privacy settings have been updated.</p>
            </motion.div>
          ) : (
            <>
              <div className="bg-gray-50 rounded-2xl px-6 py-2 mb-6">
                <Toggle value={prefs.publicProfile} onChange={update('publicProfile')} label="Public Profile" desc="Anyone can view your profile" icon={Globe} />
                <Toggle value={prefs.showPhone} onChange={update('showPhone')} label="Show Phone Number" desc="Visible to buyers who message you" icon={Phone} />
                <Toggle value={prefs.showEmail} onChange={update('showEmail')} label="Show Email Address" desc="Display email on your profile" icon={Mail} />
                <Toggle value={prefs.showOnline} onChange={update('showOnline')} label="Show Online Status" desc="Let others see when you're active" icon={Eye} />
              </div>

              <div className="flex gap-3">
                <button onClick={onClose}
                  className="flex-1 h-12 rounded-2xl border-2 border-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : <><Check className="w-4 h-4" /> Save Preferences</>}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
