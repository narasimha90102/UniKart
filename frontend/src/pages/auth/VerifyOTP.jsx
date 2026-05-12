import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Clock, RefreshCw, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../utils/api';

export function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [activeInput, setActiveInput] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const inputRefs = useRef([]);
  const email = location.state?.email || localStorage.getItem('pending_verification_email') || 'your email';

  // Timer logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Focus management
  useEffect(() => {
    if (inputRefs.current[activeInput]) {
      inputRefs.current[activeInput].focus();
    }
  }, [activeInput]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        setActiveInput(index - 1);
      }
    }
  };

  const handleChange = (val, index) => {
    if (isNaN(val)) return;
    
    const newOtp = [...otp];
    // Take only the last character if multiple are pasted/entered
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    if (val && index < 5) {
      setActiveInput(index + 1);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setResendSuccess(false);
    try {
      const res = await api.post('/auth/resend-otp', { email });
      
      setTimer(600);
      setCanResend(false);
      setResendSuccess(res.data.message || 'New verification code sent to your email!');
      setTimeout(() => setResendSuccess(false), 8000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length === 6) {
      setLoading(true);
      setError('');
      try {
        await api.post('/auth/verify-email', {
          email,
          otp: enteredOtp
        });
        
        setIsVerified(true);
      } catch (err) {
        setError(err.response?.data?.message || 'Verification failed. Please check the code.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
          <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Verified Successfully!</h2>
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 mb-8">
            <p className="text-sm text-emerald-800 font-bold leading-relaxed">
              Your identity has been confirmed. Your account is now <span className="underline decoration-2">Waiting for Campus Administrator Approval</span>.
            </p>
          </div>
          <Button onClick={() => navigate('/login')} size="lg" className="w-full rounded-2xl h-14 bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20">
            Back to Login
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-gray-100 relative"
      >
        <button 
          onClick={() => navigate('/signup')} 
          className="absolute top-8 left-8 p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-[2rem] bg-primary/5 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">Check your email</h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Security Verification</p>
          
          <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">
              We've sent a 6-digit verification code to:
            </p>
            <p className="text-sm font-black text-gray-900 mt-1">{email}</p>
          </div>

          {location.state?.message && !error && !resendSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="mt-6 p-4 bg-primary/5 text-primary rounded-2xl border border-primary/10 text-xs font-bold"
            >
              {location.state.message}
            </motion.div>
          )}
        </div>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-between gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onChange={(e) => handleChange(e.target.value, index)}
                className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black rounded-2xl border-2 transition-all outline-none ${
                  activeInput === index 
                    ? 'border-primary bg-white shadow-lg shadow-primary/5 ring-4 ring-primary/5' 
                    : 'border-gray-100 bg-gray-50 text-gray-400'
                }`}
              />
            ))}
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {resendSuccess && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              New verification code sent to your email!
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${timer > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                <Clock className="w-3.5 h-3.5" />
                {timer > 0 ? formatTime(timer) : 'Expired'}
              </div>
              
              <button 
                type="button" 
                disabled={!canResend || loading}
                onClick={handleResend}
                className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${
                  canResend ? 'text-primary hover:text-primary/70' : 'text-gray-300'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${loading && canResend ? 'animate-spin' : ''}`} />
                Resend Code
              </button>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              disabled={loading || otp.some(d => !d)} 
              className="w-full rounded-[1.25rem] h-14 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[11px]"
            >
              {loading ? 'Verifying...' : 'Verify Identity'}
              {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>
          </div>
        </form>

        <p className="text-center mt-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Secured by UniKart Campus Verification
        </p>
      </motion.div>
    </div>
  );
}
