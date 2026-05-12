import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Package, Tag, MessageSquare, CheckCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useNotifications } from '../../context/NotificationContext';

export function Notifications() {
  const { notifications, markAllAsRead, clearAllNotifications, markNotificationAsRead } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type, title) => {
    if (type === 'price_drop' || title.includes('Price Drop')) return <Tag className="w-5 h-5 text-pink-500" />;
    if (type === 'order' || title.includes('Order')) return <Package className="w-5 h-5 text-indigo-500" />;
    if (type === 'message' || title.includes('Message')) return <MessageSquare className="w-5 h-5 text-emerald-500" />;
    return <Bell className="w-5 h-5 text-primary" />;
  };

  const handleNotificationClick = async (notif) => {
    // Mark as read if not already
    if (!notif.read) {
      await markNotificationAsRead(notif._id || notif.id);
    }

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
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl mx-auto px-4 py-4 sm:py-8 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Stay updated with your UniKart activity</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 sm:flex-none text-gray-400 hover:text-red-500 rounded-xl bg-gray-50/50 sm:bg-transparent" 
            onClick={clearAllNotifications}
          >
            <Trash2 className="w-4 h-4 mr-2" /> <span className="sm:inline">Clear All</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 sm:flex-none text-primary border-primary/20 hover:bg-primary/5 rounded-xl" 
            onClick={markAllAsRead}
          >
            <CheckCircle className="w-4 h-4 mr-2"/> <span className="sm:inline">Mark all read</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/30 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-20 sm:py-32 text-center px-6">
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Bell className="w-10 h-10 text-gray-200" />
            </div>
            <h2 className="text-lg font-black text-gray-900 mb-2">You're all caught up!</h2>
            <p className="text-sm font-medium text-gray-400 max-w-xs mx-auto leading-relaxed">
              When you get new messages or updates on your orders, they'll show up here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((notif, idx) => (
              <div 
                key={notif._id || idx} 
                onClick={() => handleNotificationClick(notif)}
                className={`p-5 sm:p-7 flex gap-4 sm:gap-6 transition-all cursor-pointer hover:bg-primary/[0.01] ${notif.read ? 'bg-white' : 'bg-primary/[0.02]'}`}
              >
                <div className={`mt-1 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl flex items-center justify-center shrink-0 shadow-sm border ${notif.read ? 'bg-white border-gray-100' : 'bg-white border-primary/10'}`}>
                  {getIcon(notif.type, notif.title)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <h3 className={`text-sm sm:text-base font-black truncate ${notif.read ? 'text-gray-600' : 'text-gray-900'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter whitespace-nowrap pt-1">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Today'}
                    </span>
                  </div>
                  <p className={`text-xs sm:text-sm leading-relaxed ${notif.read ? 'text-gray-400' : 'text-gray-500'} line-clamp-3`}>
                    {notif.message}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${notif.read ? 'bg-gray-100 text-gray-400' : 'bg-primary/10 text-primary'}`}>
                      {notif.type || 'system'}
                    </span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
