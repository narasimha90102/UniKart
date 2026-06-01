import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [chatUnreadCounts, setChatUnreadCounts] = useState({}); // { userId: count }
  // Toast state for in-app notification popups
  const [toasts, setToasts] = useState([]); // [{ id, senderName, message, senderId, senderAvatar, chatRoom }]
  // Track which chat is currently active so we don't double-notify
  const activeChatRef = useRef(null);

  const { socket } = useSocket();
  const { user } = useAuth();

  // ─── Computed totals ────────────────────────────────────────────────────────
  const totalUnreadMessages = Object.values(chatUnreadCounts).reduce((a, b) => a + b, 0);
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // ─── Initial fetch on login ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setChatUnreadCounts({});
      return;
    }

    const fetchAll = async () => {
      try {
        // 1. Fetch unread counts per conversation
        const { data: convData } = await api.get('/chat/conversations');
        const counts = {};
        (convData.data || []).forEach(c => {
          if (c.unread > 0) counts[String(c.id)] = c.unread;
        });
        setChatUnreadCounts(counts);

        // 2. Fetch notifications
        const { data: notifData } = await api.get('/notifications');
        const notifList = notifData.data || [];
        setNotifications(notifList);
      } catch (err) {
        console.error('[Notifications] Failed to fetch initial data', err);
      }
    };

    fetchAll();
  }, [user?._id || user?.id]);

  // ─── Socket event listeners ───────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !user) return;

    // New message alert (receiver is NOT in the room)
    const handleMessageAlert = (msg) => {
      const senderId = String(msg.senderId);
      const currentUserId = String(user._id || user.id);

      // Don't update unread for my own messages
      if (senderId === currentUserId) return;

      // Don't add unread if this chat is currently active
      if (activeChatRef.current === senderId) return;

      // Increment unread count for this sender
      setChatUnreadCounts(prev => ({
        ...prev,
        [senderId]: (prev[senderId] || 0) + 1
      }));

      // Show in-app toast
      const toastId = `${senderId}-${Date.now()}`;
      setToasts(prev => {
        // Remove any existing toast from same sender
        const filtered = prev.filter(t => t.senderId !== senderId);
        return [...filtered, {
          id: toastId,
          senderId,
          senderName: msg.senderName || 'Someone',
          message: msg.content || 'Sent an image',
          senderAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName || 'U')}&background=1B8C50&color=fff`,
          chatRoom: msg.room
        }];
      });

      // Auto-dismiss toast after 4 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toastId));
      }, 4000);
    };

    // New persistent notification from backend
    const handleNewNotification = (notif) => {
      setNotifications(prev => {
        // Deduplicate by senderId — only keep the latest from each sender
        const filtered = notif.senderId
          ? prev.filter(n => !(n.type === 'message' && String(n.senderId) === String(notif.senderId)))
          : prev;
        return [notif, ...filtered];
      });
    };

    // Server-side unread count update (cross-tab sync)
    const handleUnreadCountUpdate = ({ totalUnread }) => {
      // Re-fetch conversations to get per-sender breakdown
      api.get('/chat/conversations').then(({ data }) => {
        const counts = {};
        (data.data || []).forEach(c => {
          if (c.unread > 0) counts[String(c.id)] = c.unread;
        });
        setChatUnreadCounts(counts);
      }).catch(() => {});
    };

    socket.on('new_message_alert', handleMessageAlert);
    socket.on('new_notification', handleNewNotification);
    socket.on('unread_count_update', handleUnreadCountUpdate);

    return () => {
      socket.off('new_message_alert', handleMessageAlert);
      socket.off('new_notification', handleNewNotification);
      socket.off('unread_count_update', handleUnreadCountUpdate);
    };
  }, [socket, user]);

  // ─── Actions ─────────────────────────────────────────────────────────────────

  // Called when user opens a chat — zeroes out that sender's unread count
  const markChatRead = useCallback(async (otherUserId) => {
    if (!otherUserId) return;
    const id = String(otherUserId);

    // Optimistic UI update
    setChatUnreadCounts(prev => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });

    // Remove message-type notifications for this sender
    setNotifications(prev =>
      prev.filter(n => !(n.type === 'message' && String(n.senderId) === id))
    );

    // Dismiss toast for this sender
    setToasts(prev => prev.filter(t => t.senderId !== id));

    // Persist to backend
    try {
      await api.put(`/chat/mark-read/${id}`);
    } catch (err) {
      console.error('[Notifications] markChatRead failed', err);
    }
  }, []);

  // Set which chat is currently open (prevents notifications for active chat)
  const setActiveChat = useCallback((otherUserId) => {
    activeChatRef.current = otherUserId ? String(otherUserId) : null;
  }, []);

  // Mark all system notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/mark-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('[Notifications] markAllAsRead failed', err);
    }
  }, []);
  
  // Mark a single notification as read
  const markNotificationAsRead = useCallback(async (notifId) => {
    try {
      await api.put(`/notifications/${notifId}/mark-read`);
      setNotifications(prev => prev.map(n => 
        (n._id === notifId || n.id === notifId) ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('[Notifications] markNotificationAsRead failed', err);
    }
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
    } catch (err) {
      console.error('[Notifications] clearAllNotifications failed', err);
    }
  }, []);

  // Delete a single notification
  const deleteNotification = useCallback(async (notifId) => {
    try {
      // Optimistic update
      setNotifications(prev => prev.filter(n => n._id !== notifId && n.id !== notifId));
      await api.delete(`/notifications/${notifId}`);
    } catch (err) {
      console.error('[Notifications] deleteNotification failed', err);
    }
  }, []);

  // Legacy: called when entering chat page to clear message badge
  const markMessagesAsRead = useCallback(() => {
    setChatUnreadCounts({});
  }, []);

  // Dismiss a single toast
  const dismissToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  const value = React.useMemo(() => ({
    notifications,
    chatUnreadCounts,
    totalUnreadMessages,
    unreadNotificationsCount,
    toasts,
    markChatRead,
    setActiveChat,
    markAllAsRead,
    markNotificationAsRead,
    markMessagesAsRead,
    clearAllNotifications,
    deleteNotification,
    dismissToast,
  }), [
    notifications, 
    chatUnreadCounts, 
    totalUnreadMessages, 
    unreadNotificationsCount, 
    toasts, 
    markChatRead, 
    setActiveChat, 
    markAllAsRead, 
    markNotificationAsRead,
    markMessagesAsRead, 
    clearAllNotifications, 
    deleteNotification,
    dismissToast
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
