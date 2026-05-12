import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

import api from '../../utils/api';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgotpassword', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50/50 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100"
      >
        {!submitted ? (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
              <p className="mt-2 text-sm text-gray-500">
                Enter your registered university email and we will send you a secure link to reset your password.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 text-base rounded-xl bg-gray-50 border-gray-200"
                  placeholder="Email (.sse@saveetha.com)"
                />
              </div>

              <Button type="submit" size="lg" className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90">
                Send Reset Link
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
              <p className="mt-2 text-sm text-gray-500">
                We've sent a password reset link to <span className="font-semibold text-gray-800">{email}</span>. Please check your inbox.
              </p>
            </div>
            
            {/* For mockup purposes, direct link to reset password */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">(Mockup Helper: Click below to simulate clicking the email link)</p>
              <Link to="/reset-password/mock-token-123">
                <Button variant="outline" className="w-full">Go to Reset Password Screen</Button>
              </Link>
            </div>
          </div>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
