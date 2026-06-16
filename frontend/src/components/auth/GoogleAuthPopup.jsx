import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, CheckCircle2 } from 'lucide-react';

// Mock Google accounts for demo — replace with real Firebase accounts if needed
const MOCK_ACCOUNTS = [
  {
    id: 1,
    name: 'Alex Johnson',
    email: 'alex.johnson@gmail.com',
    avatar: 'AJ',
    color: '#4285F4',
  },
  {
    id: 2,
    name: 'Use another account',
    email: '',
    avatar: '+',
    color: '#5f6368',
  },
];

// Google SVG Logo (official colors)
export function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AvatarCircle({ initials, color, size = 40 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white select-none shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

export function GoogleAuthPopup({ isOpen, onClose, onSuccess }) {
  const [phase, setPhase] = useState('select'); // 'select' | 'loading' | 'success'
  const [selectedAccount, setSelectedAccount] = useState(null);
  const overlayRef = useRef(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Reset state inline when isOpen transitions from false to true
  if (isOpen && !prevIsOpen) {
    setPhase('select');
    setSelectedAccount(null);
  }
  
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    setPhase('loading');

    // Simulate auth processing (1.5s)
    setTimeout(() => {
      setPhase('success');

      // After success anim, call onSuccess
      setTimeout(() => {
        onSuccess(account);
      }, 1000);
    }, 1500);
  };

  const handleOverlayClick = (e) => {
    if (phase === 'select' && e.target === overlayRef.current) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blur overlay */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(17, 24, 39, 0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={handleOverlayClick}
          >
            {/* Popup card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="relative bg-white rounded-3xl shadow-2xl overflow-hidden"
              style={{
                width: '100%',
                maxWidth: '400px',
                border: '1.5px solid rgba(66,133,244,0.13)',
                boxShadow: '0 32px 80px rgba(66,133,244,0.12), 0 8px 32px rgba(0,0,0,0.18)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close btn — only in select phase */}
              <AnimatePresence>
                {phase === 'select' && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X size={18} />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* ── SELECT PHASE ── */}
              <AnimatePresence mode="wait">
                {phase === 'select' && (
                  <motion.div
                    key="select"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="p-8 pb-6"
                  >
                    {/* Google logo + header */}
                    <div className="flex flex-col items-center gap-3 mb-6">
                      <GoogleIcon size={40} />
                      <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-800">Sign in with Google</h2>
                        <p className="text-sm text-gray-500 mt-1">to continue to UniKart</p>
                      </div>
                    </div>

                    {/* Accounts list */}
                    <div className="space-y-2">
                      {MOCK_ACCOUNTS.map((account, i) => (
                        <motion.button
                          key={account.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07, duration: 0.25 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAccountSelect(account)}
                          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-sm transition-all duration-150 group text-left"
                          style={{ outline: 'none' }}
                        >
                          <AvatarCircle initials={account.avatar} color={account.color} size={42} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors truncate">
                              {account.name}
                            </p>
                            {account.email && (
                              <p className="text-xs text-gray-500 truncate">{account.email}</p>
                            )}
                          </div>
                          <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.button>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-5 border-t border-gray-100 flex items-start gap-2 text-xs text-gray-400">
                      <Shield size={13} className="shrink-0 mt-0.5 text-gray-300" />
                      <span>
                        By continuing, Google will share your name, email, and profile picture with UniKart.
                        See UniKart's{' '}
                        <span className="text-blue-500 cursor-pointer hover:underline">Privacy Policy</span>.
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* ── LOADING PHASE ── */}
                {phase === 'loading' && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center justify-center gap-5 py-14 px-8"
                  >
                    <div className="relative w-14 h-14">
                      {/* Outer spinner ring */}
                      <svg className="absolute inset-0 animate-spin" viewBox="0 0 56 56" fill="none">
                        <circle cx="28" cy="28" r="24" stroke="#e8eaed" strokeWidth="4" />
                        <path
                          d="M28 4a24 24 0 0 1 24 24"
                          stroke="#4285F4"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Google icon center */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <GoogleIcon size={22} />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Signing you in…</p>
                      {selectedAccount?.email && (
                        <p className="text-xs text-gray-400 mt-1 truncate max-w-[240px]">{selectedAccount.email}</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── SUCCESS PHASE ── */}
                {phase === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className="flex flex-col items-center justify-center gap-4 py-14 px-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #34A853 60%, #4285F4 100%)' }}
                    >
                      <CheckCircle2 className="text-white" size={30} />
                    </motion.div>
                    <div className="text-center">
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-sm font-semibold text-gray-800"
                      >
                        Signed in successfully!
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.22 }}
                        className="text-xs text-gray-400 mt-1"
                      >
                        Redirecting to your dashboard…
                      </motion.p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
