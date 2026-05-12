import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.DEV
  ? window.location.origin
  : (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastSeenMap, setLastSeenMap] = useState({}); // { userId: ISOString }
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    if (!user) return;

    const userId = user._id || user.id;
    console.log('[Socket] Connecting for user:', userId, user.name);

    const newSocket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
      withCredentials: false,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[Socket] Connected! ID:', newSocket.id);
      if (userId) {
        newSocket.emit('register_user', String(userId));
        console.log('[Socket] Registered user:', userId);
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
    });

    newSocket.on('reconnect', () => {
      if (userId) {
        newSocket.emit('register_user', String(userId));
        console.log('[Socket] Re-registered after reconnect');
      }
    });

    // Get initial list of online users
    newSocket.on('online_users', (userIds) => {
      setOnlineUsers(new Set(userIds.map(id => String(id))));
    });

    // Listen for user status changes — includes lastSeen on offline
    newSocket.on('user_status', ({ userId: uid, status, lastSeen }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (status === 'online') {
          newSet.add(String(uid));
        } else {
          newSet.delete(String(uid));
        }
        return newSet;
      });

      // Store lastSeen timestamp when they go offline
      if (status === 'offline' && lastSeen) {
        setLastSeenMap(prev => ({ ...prev, [String(uid)]: lastSeen }));
      }
    });

    return () => {
      console.log('[Socket] Cleaning up');
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id || user?.id]);

  const value = React.useMemo(() => ({ 
    socket, 
    onlineUsers, 
    lastSeenMap 
  }), [socket, onlineUsers, lastSeenMap]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
