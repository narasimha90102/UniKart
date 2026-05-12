import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Package, Tag, MessageSquare, CheckCircle, Trash2, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNotifications } from '../../context/NotificationContext';

export function NotificationDropdown({ isOpen, onClose }) {
  const { notifications, markAllAsRead, clearAllNotifications, markNotificationAsRead } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type, title) => {
    if (type === 'price_drop' || title.includes('Price Drop')) return <Tag className="w-4 h-4 text-pink-500" />;
    if (type === 'order' || title.includes('Order')) return <Package className="w-4 h-4 text-indigo-500" />;
    if (type === 'message' || title.includes('Message')) return <MessageSquare className="w-4 h-4 text-emerald-500" />;
    return <Bell className="w-4 h-4 text-primary" />;
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for clicking outside */}
          <div className="fixed inset-0 z-40" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/90 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-3xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50">
              <div>
                <h3 className="font-black text-gray-900 tracking-tight">Notifications</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Recent Updates</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary rounded-xl" onClick={markAllAsRead} title="Mark all read">
                  <CheckCircle className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500 rounded-xl" onClick={clearAllNotifications} title="Clear all">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="py-12 px-6 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-gray-200" />
                  </div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">All Caught Up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.slice(0, 10).map((notif, idx) => (
                    <div
                      key={notif._id || idx}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 flex gap-4 transition-all cursor-pointer hover:bg-primary/[0.02] ${notif.read ? 'opacity-60' : 'bg-primary/[0.01]'}`}
                    >
                      <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${notif.read ? 'bg-white border-gray-100' : 'bg-white border-primary/10'}`}>
                        {getIcon(notif.type, notif.title)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-0.5">
                          <h4 className={`text-xs font-black truncate ${notif.read ? 'text-gray-600' : 'text-gray-900'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter whitespace-nowrap">
                            {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-snug line-clamp-2 ${notif.read ? 'text-gray-400' : 'text-gray-500'}`}>
                          {notif.message}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shadow-lg shadow-primary/20 shrink-0"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link 
              to="/dashboard/notifications" 
              onClick={onClose}
              className="block p-3 text-center text-[11px] font-bold text-primary uppercase tracking-widest bg-gray-50/50 hover:bg-primary/5 transition-colors border-t border-gray-100"
            >
              See all notifications
            </Link>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
