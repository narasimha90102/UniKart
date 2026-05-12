import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

import api from '../../utils/api';

export function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.put(`/auth/resetpassword/${token}`, { password });
      alert("Password successfully reset! Please login.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Token might be expired.');
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
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Create New Password</h2>
          <p className="mt-2 text-sm text-gray-500">
            Please enter your new password below to regain access to your account.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 h-12 text-base rounded-xl bg-gray-50 border-gray-200"
                placeholder="New Password"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-11 h-12 text-base rounded-xl bg-gray-50 border-gray-200"
                placeholder="Confirm New Password"
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90">
            Reset Password <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
