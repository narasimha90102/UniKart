import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Loader2, XCircle, ShieldCheck, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../utils/api';

export function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [verifying, setVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password strength requirements
  const requirements = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'At least one uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'At least one lowercase letter', test: (p) => /[a-z]/.test(p) },
    { label: 'At least one number', test: (p) => /[0-9]/.test(p) },
    { label: 'At least one special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];

  const metCount = requirements.filter(req => req.test(password)).length;
  const isPasswordStrong = metCount === requirements.length;

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        await api.get(`/auth/resetpassword/${token}`);
        setIsValidToken(true);
      } catch (err) {
        setError(err.response?.data?.message || 'The password reset link is invalid or has expired.');
        setIsValidToken(false);
      } finally {
        setVerifying(false);
      }
    };
    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordStrong) {
      setError('Please meet all password strength requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/auth/resetpassword/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state when verifying token on page load
  if (verifying) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gray-50/50 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100/80 text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto shadow-inner">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Verifying Reset Link</h3>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              Checking the validity of your secure security token...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Token is invalid/expired
  if (!isValidToken && !success) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gray-50/50 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100/80 text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto shadow-inner">
            <XCircle className="w-8 h-8 text-red-500 animate-bounce" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Link Expired or Invalid</h2>
            <p className="mt-3 text-sm text-red-600/90 bg-red-50/60 p-3.5 rounded-xl border border-red-100/70 font-semibold leading-relaxed">
              {error}
            </p>
            <p className="text-sm text-gray-500 mt-4 leading-relaxed font-medium">
              For security, password reset links are only valid for 15 minutes and can only be used once.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Button
              onClick={() => navigate('/forgot-password')}
              className="w-full rounded-xl h-12 bg-primary hover:bg-primary/95 text-white font-bold shadow-md shadow-primary/20 transition-all duration-200"
            >
              Request New Reset Link
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              className="w-full rounded-xl h-11 text-gray-600 hover:bg-gray-50 font-bold"
            >
              Back to Login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Password reset success screen
  if (success) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gray-50/50 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100/80 text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-10 h-10 text-green-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Password Updated!</h2>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed font-medium">
              Your password has been successfully updated. Redirecting you to login screen in a few seconds...
            </p>
          </div>
          <Button
            className="w-full rounded-xl h-12 bg-primary hover:bg-primary/95 text-white font-bold shadow-md shadow-primary/20"
            onClick={() => navigate('/login')}
          >
            Go to Login Now
          </Button>
        </motion.div>
      </div>
    );
  }

  // Active password reset form (token verified successfully)
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gray-50/50 py-16">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-md w-full bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100/80"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create New Password</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Please enter a strong new password to secure your account.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* New Password Input */}
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <Input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 pr-11 h-12 text-base rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all"
              placeholder="New Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password Strength Indicators */}
          {password.length > 0 && (
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1">
                <span>Password Strength</span>
                <span className={
                  metCount === 5 ? 'text-green-600' : metCount >= 3 ? 'text-yellow-600' : 'text-red-500'
                }>
                  {metCount === 5 ? 'Strong' : metCount >= 3 ? 'Medium' : 'Weak'}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    metCount === 5 ? 'bg-green-500' : metCount >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(metCount / 5) * 100}%` }}
                />
              </div>

              {/* Requirement Checklist */}
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {requirements.map((req, index) => {
                  const isMet = req.test(password);
                  return (
                    <div key={index} className="flex items-center gap-2 text-xs font-medium">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        isMet ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className={isMet ? 'text-gray-700 font-semibold' : 'text-gray-400'}>
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Confirm Password Input */}
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <Input
              type={showConfirm ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-11 pr-11 h-12 text-base rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all"
              placeholder="Confirm New Password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-100 rounded-xl"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-semibold leading-relaxed">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={loading || !isPasswordStrong}
            className="w-full rounded-xl h-12 bg-primary hover:bg-primary/95 text-white font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving Password...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>

        <hr className="my-6 border-gray-100" />

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
