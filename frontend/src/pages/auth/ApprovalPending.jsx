import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, ShieldAlert, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ApprovalPending() {
  return (
    <div className="h-[calc(100vh-56px)] w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50/50 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full text-center bg-white px-6 py-6 md:px-8 rounded-[2rem] shadow-xl border border-gray-100/80 relative overflow-hidden flex flex-col justify-center"
      >
        {/* Dynamic Glassmorphism Background Accent */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          {/* Pulsing Visual Container */}
          <div className="mx-auto w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-3xl bg-amber-500/10 blur-md"
            />
            <Clock className="w-10 h-10 text-amber-500 relative z-10" />
          </div>
          
          <h2 className="mt-4 text-2xl font-black text-gray-900 tracking-tight leading-none">
            Awaiting Approval
          </h2>
          <p className="mt-1.5 text-[11px] font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50/50 inline-block px-3 py-0.5 rounded-full border border-amber-100">
            Status: Under Review
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-sm text-gray-600 font-bold leading-normal">
            Your account has been created successfully.
          </p>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 text-left relative">
            <span className="block font-black text-gray-800 text-[10px] uppercase tracking-wider mb-1">Notice from UniKart:</span>
            Your account is currently under review by the UniKart team. You will be able to log in once your account is approved.
          </p>
        </div>

        <div className="mt-4">
          <Link to="/login" className="block w-full">
            <Button className="w-full h-11 rounded-xl font-bold bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/95 transition-all flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Return to Login
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
