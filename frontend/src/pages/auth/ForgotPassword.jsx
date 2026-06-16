import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, Loader2, RefreshCw, Edit2, Inbox, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../utils/api';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Manage the 60-second resend cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || loading) return;

    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgotpassword', { email: email.trim().toLowerCase() });
      setSubmitted(true);
      setCooldown(60); // Initialize 60s countdown
    } catch (err) {
      setError(err.response?.data?.message || 'Email could not be sent. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setError('');
    setResending(true);
    try {
      await api.post('/auth/forgotpassword', { email: email.trim().toLowerCase() });
      setCooldown(60); // Reset timer
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend the reset instructions. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleChangeEmail = () => {
    setSubmitted(false);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gray-50/50 py-16">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-md w-full bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100/80 flex flex-col"
      >
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="request-form"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="text-center">
                {/* Visual Icon Header */}
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <Mail className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
                  Forgot Password?
                </h2>
                <p className="mt-2 text-sm text-gray-500 font-medium px-2 leading-relaxed">
                  Enter your registered email and we'll verify your account details to send reset instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 text-base rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all"
                    placeholder="University Email Address"
                    aria-label="Email Address"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-100 rounded-xl"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700 font-semibold leading-relaxed">
                      {error}
                    </div>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full rounded-xl h-12 bg-primary hover:bg-primary/95 text-white font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending Instructions...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="confirmation-screen"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="text-center space-y-6"
            >
              {/* Premium Success Animation Container */}
              <div className="relative w-20 h-20 mx-auto mb-2">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center shadow-sm"
                >
                  <Inbox className="w-9 h-9 text-green-500" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow"
                >
                  <CheckCircle2 className="w-6 h-6 text-green-500 fill-white" />
                </motion.div>
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
                  Check Your Email
                </h2>
                <p className="mt-3 text-sm text-gray-500 px-1 leading-relaxed font-medium">
                  If an account exists for <span className="text-gray-800 font-bold">{email}</span>, we've sent password reset instructions.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-left"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700 font-semibold leading-relaxed">
                    {error}
                  </span>
                </motion.div>
              )}

              {/* Action Buttons Grid */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleResend}
                  variant={cooldown > 0 ? 'ghost' : 'outline'}
                  disabled={cooldown > 0 || resending}
                  className="w-full rounded-xl h-11 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 flex items-center justify-center gap-2 transition-all"
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      Resending...
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      Resend Email in {cooldown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 text-gray-500" />
                      Resend Email
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleChangeEmail}
                  variant="ghost"
                  className="w-full rounded-xl h-11 text-primary hover:bg-indigo-50/40 font-bold flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Change Email
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
