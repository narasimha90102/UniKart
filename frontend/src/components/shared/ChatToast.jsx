import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

export function ChatToast() {
  const { toasts, dismissToast } = useNotifications();
  const navigate = useNavigate();

  const handleClick = (toast) => {
    dismissToast(toast.id);
    navigate('/dashboard/chat', {
      state: {
        sellerId: toast.senderId,
        sellerName: toast.senderName,
        sellerAvatar: toast.senderAvatar,
      }
    });
  };

  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="pointer-events-auto"
          >
            <div
              onClick={() => handleClick(toast)}
              className="flex items-center gap-3 bg-white border border-gray-100 shadow-2xl shadow-gray-300/40 rounded-2xl px-4 py-3 cursor-pointer hover:shadow-primary/10 hover:border-primary/20 transition-all w-80 max-w-[calc(100vw-2rem)]"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={toast.senderAvatar}
                  alt={toast.senderName}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <MessageSquare className="w-3 h-3 text-primary shrink-0" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">New Message</span>
                </div>
                <p className="text-sm font-black text-gray-900 leading-none truncate">{toast.senderName}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{toast.message}</p>
              </div>

              {/* Dismiss */}
              <button
                onClick={(e) => { e.stopPropagation(); dismissToast(toast.id); }}
                className="p-1 text-gray-300 hover:text-gray-500 transition-colors shrink-0 rounded-lg hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
