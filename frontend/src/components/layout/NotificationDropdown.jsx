import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Package, Tag, MessageSquare, Trash2, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export function NotificationDropdown({ isOpen, onClose, triggerRef }) {
  const { 
    notifications, 
    clearAllNotifications, 
    markNotificationAsRead, 
    deleteNotification 
  } = useNotifications();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Ref-based click-outside — prevents the two-touch/double-click issue caused by
  // the old full-screen backdrop div stealing the first touch/click event.
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!isOpen) return;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        (!triggerRef?.current || !triggerRef.current.contains(event.target))
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen, onClose, triggerRef]);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const getIcon = (type, title) => {
    if (type === 'price_drop' || title?.includes('Price Drop')) return <Tag className="w-4 h-4 text-pink-500" />;
    if (type === 'order' || title?.includes('Order')) return <Package className="w-4 h-4 text-indigo-500" />;
    if (type === 'message' || title?.includes('Message')) return <MessageSquare className="w-4 h-4 text-emerald-500" />;
    return <Bell className="w-4 h-4 text-[#1B8C50]" />;
  };

  const handleNotificationClick = (notif) => {
    markNotificationAsRead(notif._id || notif.id);
    onClose();
    if (notif.type === 'message' && notif.senderId) {
      navigate('/dashboard/chat', {
        state: {
          sellerId: notif.senderId,
          sellerName: notif.senderName || 'User',
          sellerAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.senderName || 'U')}&background=1B8C50&color=fff`,
        }
      });
    } else if (notif.type === 'order') {
      navigate('/dashboard/orders');
    } else {
      navigate('/dashboard/notifications');
    }
  };

  const handleDelete = (e, notifId) => {
    e.stopPropagation();
    deleteNotification(notifId);
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    clearAllNotifications();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-100 shadow-2xl rounded-3xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-black text-gray-900 tracking-tight text-sm">Notifications</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Recent Updates</p>
            </div>
            <div className="flex gap-1">
              {/* ICON 1: Delete/Trash — clears all notifications */}
              <button
                onClick={handleClearAll}
                title="Clear all notifications"
                className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {/* ICON 2: Close (X) — closes the dropdown */}
              <button
                onClick={onClose}
                title="Close"
                className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 px-6 text-center"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-gray-100">
                    <Bell className="w-6 h-6 text-gray-200" />
                  </div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">All Caught Up!</p>
                </motion.div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.slice(0, 10).map((notif) => (
                    <motion.div
                      key={notif._id || notif.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40, height: 0 }}
                      transition={{ type: 'spring', damping: 22, stiffness: 200 }}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 flex gap-3 transition-all cursor-pointer hover:bg-gray-50 group relative ${notif.read ? 'opacity-60' : ''}`}
                    >
                      {/* Type icon */}
                      <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${notif.read ? 'bg-white border-gray-100' : 'bg-white border-[#1B8C50]/10'}`}>
                        {getIcon(notif.type, notif.title)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-5">
                        <div className="flex justify-between items-start gap-2 mb-0.5">
                          <h4 className={`text-xs font-black truncate ${notif.read ? 'text-gray-600' : 'text-gray-900'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap shrink-0">
                            {notif.createdAt
                              ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'Just now'}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-snug line-clamp-2 ${notif.read ? 'text-gray-400' : 'text-gray-500'}`}>
                          {notif.message}
                        </p>
                      </div>

                      {/* Unread dot + hover delete */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                        {!notif.read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#1B8C50] shadow-sm group-hover:hidden" />
                        )}
                        <button
                          onClick={(e) => handleDelete(e, notif._id || notif.id)}
                          className="hidden group-hover:flex items-center justify-center p-1 hover:bg-red-50 hover:text-red-500 rounded-lg text-gray-400 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <Link
            to="/dashboard/notifications"
            onClick={onClose}
            className="block p-3 text-center text-[11px] font-bold text-[#1B8C50] uppercase tracking-widest bg-gray-50/60 hover:bg-[#1B8C50]/5 transition-colors border-t border-gray-100"
          >
            See all notifications
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
