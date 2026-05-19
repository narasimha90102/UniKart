import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import api from '../../utils/api';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
    { label: 'Special character', pass: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score - 1] : 'bg-gray-100'}`}
          />
        ))}
      </div>
      {score > 0 && (
        <p className={`text-[10px] font-black uppercase tracking-widest ${score === 4 ? 'text-emerald-500' : score >= 2 ? 'text-yellow-500' : 'text-red-500'}`}>
          {labels[score - 1]}
        </p>
      )}
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 ${c.pass ? 'bg-emerald-100' : 'bg-gray-100'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${c.pass ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-tight ${c.pass ? 'text-emerald-600' : 'text-gray-400'}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const toggle = (field) => setShow(s => ({ ...s, [field]: !s[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.current) return setError('Please enter your current password.');
    if (form.newPass.length < 8) return setError('New password must be at least 8 characters.');
    if (form.newPass !== form.confirm) return setError('New passwords do not match.');

    const checks = [/[A-Z]/.test(form.newPass), /\d/.test(form.newPass)];
    if (!checks.every(Boolean)) return setError('Password must include an uppercase letter and a number.');

    setLoading(true);
    try {
      await api.put('/users/update-password', {
        currentPassword: form.current,
        newPassword: form.newPass,
      });
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PasswordField = ({ label, field, placeholder }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <input
          type={show[field] ? 'text' : 'password'}
          value={form[field]}
          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
          placeholder={placeholder}
          className="w-full h-14 px-5 pr-14 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-white transition-all"
        />
        <button
          type="button"
          onClick={() => toggle(field)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
        >
          {show[field] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
          className="absolute inset-0 bg-black/50 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          variants={panelVariants} initial="hidden" animate="visible" exit="exit"
          className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tighter">Change Password</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Keep your account secure</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {success ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tighter mb-2">Password Updated!</h3>
              <p className="text-sm text-gray-500 font-bold">Your password has been changed securely.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <PasswordField label="Current Password" field="current" placeholder="Your current password" />
              <div>
                <PasswordField label="New Password" field="newPass" placeholder="Create a strong password" />
                <PasswordStrength password={form.newPass} />
              </div>
              <PasswordField label="Confirm New Password" field="confirm" placeholder="Repeat new password" />

              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-xs font-bold text-red-600">{error}</p>
                </motion.div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={onClose}
                  className="flex-1 h-14 rounded-2xl border-2 border-gray-100 text-gray-600 font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors"
                >Cancel</button>
                <button
                  type="submit" disabled={loading}
                  className="flex-1 h-14 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating…</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Update Password</>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
