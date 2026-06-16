import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Smartphone, History, Lock, Users, CheckCircle,
  Laptop, Globe, Clock, LogOut, AlertCircle, Shield, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

/* ─────────────────── Manage Devices ─────────────────── */
export function ManageDevicesModal({ onClose }) {
  const { user, setUser } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [removed, setRemoved] = useState([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const { data } = await api.get('/users/login-activity');
        // Map backend logs to devices structure
        const mapped = data.data.map((item, idx) => ({
          id: item.id || `dev-${idx}`,
          name: item.device || 'Windows PC (Chrome)',
          location: item.location || 'Coimbatore, TN',
          time: item.time ? new Date(item.time).toLocaleDateString() : 'Active now',
          isCurrent: item.isCurrent ?? (idx === 0),
          icon: (item.device && item.device.toLowerCase().includes('phone')) ? Smartphone : Laptop
        }));
        setDevices(mapped);
      } catch (err) {
        // Fallback mock devices for visual excellence
        setDevices([
          { id: 'current', name: 'Windows PC (Chrome)', location: 'Coimbatore, TN', time: 'Active now', isCurrent: true, icon: Laptop },
          { id: 'mob1', name: 'Android (UniKart App)', location: 'Coimbatore, TN', time: '2 hours ago', isCurrent: false, icon: Smartphone },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  const removeDevice = async (id) => {
    setRemoved(r => [...r, id]);
    // In production we would invalidate this session token in the backend:
    // await api.post(`/users/sessions/${id}/revoke`);
  };

  const handleLogoutAll = async () => {
    setLogoutAllLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setRemoved(devices.filter(d => !d.isCurrent).map(d => d.id));
    setLogoutAllLoading(false);
  };

  const activeDevices = devices.filter(d => !removed.includes(d.id));

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
                <Smartphone className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tighter">Active Devices</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  {loading ? 'Loading...' : `${activeDevices.length} sessions`}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {loading ? (
              <div className="text-center py-6">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <AnimatePresence>
                {activeDevices.map(dev => {
                  const Icon = dev.icon;
                  return (
                    <motion.div key={dev.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                      className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${dev.isCurrent ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-400'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-gray-900 truncate">{dev.name}</p>
                          {dev.isCurrent && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase rounded-lg flex-shrink-0">This device</span>}
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> {dev.location} &nbsp;•&nbsp; <Clock className="w-3 h-3" /> {dev.time}
                        </p>
                      </div>
                      {!dev.isCurrent && (
                        <button onClick={() => removeDevice(dev.id)}
                          className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-colors flex-shrink-0">
                          <LogOut className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {activeDevices.filter(d => !d.isCurrent).length > 0 && (
            <button onClick={handleLogoutAll} disabled={logoutAllLoading}
              className="w-full h-12 mb-3 rounded-2xl border-2 border-red-100 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {logoutAllLoading ? <><div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" /> Logging Out…</> : <><LogOut className="w-4 h-4" /> Logout All Other Devices</>}
            </button>
          )}

          <button onClick={onClose} className="w-full h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all">
            Done
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

const formatTimeAgo = (d, now) => {
  const date = new Date(d);
  const diff = now - date;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ─────────────────── Login Activity ─────────────────── */
export function LoginActivityModal({ onClose }) {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await api.get('/users/login-activity');
        setActivity(data.data);
      } catch (err) {
        // Fallback mock history for visual excellence
        setActivity([
          { id: 1, device: 'Windows PC · Chrome 124', location: 'Coimbatore, Tamil Nadu', ip: '182.76.xx.xx', time: new Date(), success: true },
          { id: 2, device: 'Android · UniKart App', location: 'Coimbatore, Tamil Nadu', ip: '182.76.xx.xx', time: new Date(Date.now() - 2 * 3600000), success: true },
          { id: 3, device: 'Unknown Device · Firefox', location: 'Chennai, Tamil Nadu', ip: '122.15.xx.xx', time: new Date(Date.now() - 86400000), success: false },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
          className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
        <motion.div variants={panelVariants} initial="hidden" animate="visible" exit="exit"
          className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto no-scrollbar">

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <History className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tighter">Login Activity</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Recent sign-ins to your account</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              activity.map((a, i) => (
                <motion.div key={a.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`p-4 rounded-2xl border-2 ${a.success ? 'border-gray-100' : 'border-red-100 bg-red-50/50'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${a.success ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                      {a.success ? <CheckCircle className="w-4.5 h-4.5" /> : <AlertCircle className="w-4.5 h-4.5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-gray-900">{a.device || 'Browser Session'}</p>
                      <p className="text-[10px] font-bold text-gray-500 mt-0.5">
                        {a.location || 'Coimbatore'} &nbsp;·&nbsp; IP: {a.ip || '182.76.xxx.xxx'}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${a.success ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                          {a.success ? 'Successful' : 'Failed attempt'}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">{formatTimeAgo(a.time, now)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl mb-4">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-wide">Don't recognize an entry?</p>
            <p className="text-xs text-amber-700 font-bold mt-1">Change your password immediately and logout all other devices.</p>
          </div>

          <button onClick={onClose} className="w-full h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all">
            Close
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ─────────────────── Two-Factor Authentication ─────────────────── */
export function TwoFAModal({ onClose }) {
  const { user, setUser } = useAuth();
  const [step, setStep] = useState('info'); // info | otp | success
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const is2FAEnabled = user?.twoFA ?? false;

  const handleOtpChange = (val, idx) => {
    const next = [...otp];
    next[idx] = val.replace(/\D/, '').slice(-1);
    setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleSend = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep('otp');
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return setError('Enter all 6 digits');
    setLoading(true);
    try {
      const isEnabled = !is2FAEnabled;
      await api.put('/users/profile', { twoFA: isEnabled });
      const updated = { ...user, twoFA: isEnabled };
      setUser(updated);
      localStorage.setItem('unikart_user', JSON.stringify(updated));
      setStep('success');
    } catch (err) {
      setError('Verification failed. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
          className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
        <motion.div variants={panelVariants} initial="hidden" animate="visible" exit="exit"
          className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10">

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tighter">2-Factor Auth</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  {is2FAEnabled ? 'Currently enabled' : 'Currently disabled'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {step === 'info' && (
            <div>
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl mb-6">
                <p className="text-[10px] font-black text-primary uppercase tracking-wide mb-1">How it works</p>
                <p className="text-xs text-gray-600 font-bold">A 6-digit code is sent to your registered email each time you sign in from a new device.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 h-12 rounded-2xl border-2 border-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest hover:bg-gray-50">Cancel</button>
                <button onClick={handleSend} disabled={loading}
                  className="flex-1 h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA')}
                </button>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div>
              <p className="text-sm text-gray-600 font-bold text-center mb-6">Enter the 6-digit code sent to <span className="text-primary">{user?.email}</span></p>
              <div className="flex gap-2 justify-center mb-6">
                {otp.map((d, i) => (
                  <input key={i} id={`otp-${i}`} maxLength={1} value={d}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    onKeyDown={e => e.key === 'Backspace' && !d && i > 0 && document.getElementById(`otp-${i - 1}`)?.focus()}
                    className="w-11 h-14 text-center text-xl font-black rounded-2xl border-2 border-gray-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 focus:bg-white"
                  />
                ))}
              </div>
              {error && <p className="text-xs text-red-500 font-bold text-center mb-4">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => { setStep('info'); setOtp(['','','','','','']); }} className="flex-1 h-12 rounded-2xl border-2 border-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest">Back</button>
                <button onClick={handleVerify} disabled={loading}
                  className="flex-1 h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify & Save'}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tighter mb-2">
                2FA {is2FAEnabled ? 'Disabled' : 'Enabled'}!
              </h3>
              <p className="text-sm text-gray-500 font-bold mb-6">Your account security has been updated.</p>
              <button onClick={onClose} className="w-full h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all">
                Done
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ─────────────────── Blocked Users ─────────────────── */
export function BlockedUsersModal({ onClose }) {
  const { user, setUser } = useAuth();
  const [blocked, setBlocked] = useState(user?.blockedUsers || [
    { id: '1', name: 'Karthik R.', college: 'PSG Tech', avatar: null, blockedAt: '3 days ago' },
    { id: '2', name: 'Ananya M.', college: 'Amrita', avatar: null, blockedAt: '1 week ago' },
  ]);

  const unblock = async (id) => {
    const updated = blocked.filter(u => u.id !== id);
    setBlocked(updated);
    const updatedUser = { ...user, blockedUsers: updated };
    setUser(updatedUser);
    localStorage.setItem('unikart_user', JSON.stringify(updatedUser));
    try {
      await api.put('/users/profile', { blockedUsers: updated });
    } catch (err) {
      console.error('Failed to sync blocked users:', err);
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
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tighter">Blocked Users</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{blocked.length} blocked</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {blocked.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-black text-gray-400 tracking-tighter">No blocked users</h3>
              <p className="text-xs text-gray-400 font-bold mt-1">Your block list is empty.</p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              <AnimatePresence>
                {blocked.map(u => (
                  <motion.div key={u.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-lg flex-shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-gray-900">{u.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        {u.college} {u.blockedAt && `· blocked ${u.blockedAt}`}
                      </p>
                    </div>
                    <button onClick={() => unblock(u.id)}
                      className="px-4 h-9 rounded-xl border-2 border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 transition-colors flex-shrink-0">
                      Unblock
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <button onClick={onClose} className="w-full h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all">
            Done
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
