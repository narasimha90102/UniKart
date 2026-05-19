import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { Send, Image as ImageIcon, MoreVertical, Search, UserPlus, Circle, CheckCheck, X, MessageSquare, ShieldCheck, Wifi, WifiOff, Trash2, User, Clock, ArrowLeft, Paperclip, Image, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ChatWallpaper } from '../../components/shared/ChatWallpaper';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';

const getAvatarUrl = (avatar, name = 'User') => {
  if (!avatar || avatar === 'default-avatar.png') {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1B8C50&color=fff`;
  }
  return avatar;
};

export function Chat() {
  const location = useLocation();
  const { socket, onlineUsers, lastSeenMap } = useSocket();
  const { user } = useAuth();
  const { chatUnreadCounts, markChatRead, setActiveChat: setGlobalActiveChat } = useNotifications();

  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Connection Monitoring
  useEffect(() => {
    if (!socket) return;
    setIsConnected(socket.connected);
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  // Sync Global Active Chat with Context (to suppress toasts)
  useEffect(() => {
    setGlobalActiveChat(activeChat?.id);
    return () => setGlobalActiveChat(null);
  }, [activeChat?.id, setGlobalActiveChat]);

  // Sidebar & Global Message Listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessageAlert = (msg) => {
      const senderId = String(msg.senderId);
      const currentUserId = String(user?._id || user?.id);
      const isFromMe = senderId === currentUserId;
      const otherPersonId = isFromMe ? String(msg.receiverId) : senderId;

      // Update sidebar contact
      setContacts(prev => {
        const exists = prev.find(c => String(c.id) === otherPersonId);
        const updatedContact = exists ? {
          ...exists,
          lastMessage: msg.content || 'Image',
          time: new Date().toISOString(),
          unread: isFromMe ? (exists.unread || 0) : (exists.unread || 0) + 1
        } : {
          id: otherPersonId,
          sender: isFromMe ? (msg.receiverName || 'User') : (msg.senderName || 'New User'),
          avatar: getAvatarUrl(null, msg.senderName || 'U'),
          lastMessage: msg.content || 'Image',
          time: new Date().toISOString(),
          unread: isFromMe ? 0 : 1
        };

        const filtered = prev.filter(c => String(c.id) !== otherPersonId);
        return [updatedContact, ...filtered];
      });
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.map(m => 
        String(m._id) === String(messageId) 
          ? { ...m, isDeleted: true, content: 'This message was deleted', imageUrl: null } 
          : m
      ));
    };

    socket.on('new_message_alert', handleNewMessageAlert);
    socket.on('message_deleted', handleMessageDeleted);

    return () => {
      socket.off('new_message_alert', handleNewMessageAlert);
      socket.off('message_deleted', handleMessageDeleted);
    };
  }, [socket, user?._id || user?.id]);

  // Initialize Contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await api.get('/chat/conversations');
        let serverContacts = res.data.data || [];
        
        // Merge with context unread counts for consistency
        serverContacts = serverContacts.map(c => ({
          ...c,
          unread: chatUnreadCounts[String(c.id)] || 0
        }));

        if (location.state?.sellerId) {
          const sellerId = String(location.state.sellerId);
          const existing = serverContacts.find(c => String(c.id) === sellerId);
          
          if (!existing) {
            const newContact = {
              id: sellerId,
              sender: location.state.sellerName || 'Seller',
              avatar: getAvatarUrl(location.state.sellerAvatar, location.state.sellerName || 'S'),
              lastMessage: location.state.productTitle ? `Item: ${location.state.productTitle}` : 'Start a conversation',
              time: new Date().toISOString(),
              unread: 0
            };
            setContacts([newContact, ...serverContacts]);
            setActiveChat(newContact);
          } else {
            setContacts(serverContacts);
            setActiveChat(existing);
          }
        } else {
          setContacts(serverContacts);
          if (serverContacts.length > 0 && !activeChat) {
            // Optional: don't auto-select on mobile, but on desktop we can
            // setActiveChat(serverContacts[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch contacts');
      }
    };
    if (user) fetchContacts();
  }, [user?._id || user?.id, location.state]);

  const currentRoom = activeChat && user ? [String(user._id || user.id), String(activeChat.id)].sort().join('-') : null;

  // Active Chat Logic (Room joining & History)
  useEffect(() => {
    if (!socket || !currentRoom || !activeChat?.id) return;

    // 1. Join room
    socket.emit('join_chat', currentRoom);
    
    // 2. Mark as read in DB
    markChatRead(activeChat.id);

    // 3. Fetch history
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await api.get(`/chat/history/${currentRoom}`);
        const history = res.data.data || [];
        setMessages(history);
        
        // Mark any unread messages as seen in UI
        const unreadIds = history
          .filter(m => String(m.senderId) === String(activeChat.id) && !m.read)
          .map(m => m._id);
        
        if (unreadIds.length > 0) {
          socket.emit('mark_seen', { 
            messageIds: unreadIds, 
            room: currentRoom,
            senderId: activeChat.id
          });
        }
        scrollToBottom('auto');
      } catch (err) {
        setMessages([]);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();

    // 4. Socket Listeners for this specific room
    const handleReceiveMessage = (message) => {
      if (message.room !== currentRoom) return;
      
      setMessages(prev => {
        // Replace optimistic temp message
        const tempIndex = prev.findIndex(m => String(m._id).startsWith('temp-') && m.content === message.content);
        if (tempIndex !== -1) {
          const updated = [...prev];
          updated[tempIndex] = message;
          return updated;
        }
        if (prev.some(m => String(m._id) === String(message._id))) return prev;
        return [...prev, message];
      });

      // If message is from other user, mark as seen immediately
      if (String(message.senderId) === String(activeChat.id)) {
        socket.emit('mark_seen', { 
          messageIds: [message._id], 
          room: currentRoom,
          senderId: activeChat.id 
        });
        markChatRead(activeChat.id);
      }
      scrollToBottom('smooth');
    };

    const handleMessagesSeen = ({ messageIds, readerId, allRead }) => {
      const myId = String(user?._id || user?.id);
      if (String(readerId) === myId) return;
      
      setMessages(prev => prev.map(m => {
        if (allRead || (messageIds && messageIds.includes(String(m._id)))) {
          return { ...m, read: true };
        }
        return m;
      }));
    };

    const handleTyping = (data) => {
      if (data.room === currentRoom && String(data.userId) === String(activeChat.id)) {
        setOtherUserTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      if (data.room === currentRoom && String(data.userId) === String(activeChat.id)) {
        setOtherUserTyping(false);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('messages_seen', handleMessagesSeen);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    return () => {
      socket.emit('leave_chat', currentRoom);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('messages_seen', handleMessagesSeen);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      setOtherUserTyping(false);
    };
  }, [socket, currentRoom, activeChat?.id, markChatRead, user?._id || user?.id]);

  const scrollToBottom = (behavior = 'smooth') => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior
        });
      }
    }, 50);
  };

  const handleTypingIndicator = (e) => {
    setMessageInput(e.target.value);
    if (!socket || !currentRoom) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { room: currentRoom, userId: user._id || user.id });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop_typing', { room: currentRoom, userId: user._id || user.id });
    }, 2000);
  };

  const sendMessage = (content = '', imageUrl = null) => {
    if ((!content.trim() && !imageUrl) || !socket || !activeChat) return;

    const messageData = {
      _id: `temp-${Date.now()}`,
      senderId: user?._id || user?.id,
      receiverId: activeChat.id,
      senderName: user?.name,
      content: content.trim(),
      imageUrl,
      room: currentRoom,
      createdAt: new Date().toISOString(),
      read: false
    };

    // Optimistic UI
    setMessages(prev => [...prev, messageData]);
    socket.emit('send_message', messageData);
    setMessageInput('');
    setIsTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('stop_typing', { room: currentRoom, userId: user._id || user.id });
    scrollToBottom('smooth');

    // Update sidebar last message
    setContacts(prev => {
      const filtered = prev.filter(c => String(c.id) !== String(activeChat.id));
      return [{
        ...activeChat,
        lastMessage: content || 'Image attached',
        time: new Date().toISOString()
      }, ...filtered];
    });
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message for everyone?')) return;
    try {
      await api.delete(`/chat/message/${messageId}`);
      socket.emit('delete_message', { messageId, room: currentRoom });
      setMessages(prev => prev.map(m => 
        String(m._id) === String(messageId) 
          ? { ...m, isDeleted: true, content: 'This message was deleted', imageUrl: null } 
          : m
      ));
    } catch (err) {
      console.error('Failed to delete message');
    }
  };

  const handleDeleteConversation = async () => {
    if (!window.confirm('Delete this entire conversation? This cannot be undone.')) return;
    try {
      await api.delete(`/chat/conversation/${activeChat.id}`);
      setContacts(prev => prev.filter(c => String(c.id) !== String(activeChat.id)));
      setActiveChat(null);
      setMessages([]);
      setIsMenuOpen(false);
    } catch (err) {
      console.error('Delete conversation failed');
    }
  };

  const handleUserSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) return setSearchResults([]);
    setSearching(true);
    try {
      const res = await api.get(`/users/search?q=${query}`);
      setSearchResults(res.data.data.filter(u => String(u._id) !== String(user?._id || user?.id)));
    } catch (err) { console.error('Search failed'); } finally { setSearching(false); }
  };

  const startNewChat = (selectedUser) => {
    const newContact = { 
      id: String(selectedUser._id), 
      sender: selectedUser.name, 
      avatar: getAvatarUrl(selectedUser.avatar, selectedUser.name), 
      lastMessage: 'Say hi!', 
      time: new Date().toISOString(),
      unread: 0
    };
    setContacts(prev => [newContact, ...prev.filter(c => String(c.id) !== String(newContact.id))]);
    setActiveChat(newContact);
    setIsSearchOpen(false);
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Offline';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Last seen just now';
    if (diff < 3600000) return `Last seen ${Math.floor(diff / 60000)}m ago`;
    if (date.toDateString() === now.toDateString()) {
      return `Last seen today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `Last seen on ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
  };

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (date.toDateString() === now.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };

  if (!user) return <div className="p-12 text-center text-gray-500 font-bold">Please login to access messages.</div>;

  return (
    <div className="flex h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden relative">
      {/* Inbox Sidebar (Chat List) */}
      <aside className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-gray-50 bg-white/30`}>
        <div className="p-6 border-b border-gray-50 bg-gray-50/20 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Messages</h2>
              <div className="flex items-center gap-1.5 mt-1">
                {isConnected ? <Wifi className="w-3 h-3 text-emerald-500" /> : <WifiOff className="w-3 h-3 text-red-500" />}
                <span className={`text-[9px] font-black uppercase tracking-widest ${isConnected ? 'text-emerald-500' : 'text-red-500'}`}>
                  {isConnected ? 'Live Sync' : 'Connecting...'}
                </span>
              </div>
            </div>
          </div>

          {/* New In-List Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full h-10 pl-10 pr-4 bg-white/50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
          {contacts.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-100 mx-auto mb-3" />
              <p className="text-xs font-bold text-gray-400">No conversations yet</p>
            </div>
          ) : (
            contacts
              .filter(c => String(c.id) !== String(user._id || user.id))
              .filter(c => c.sender.toLowerCase().includes(searchQuery.toLowerCase()) || c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(c => {
                const isOnline = onlineUsers.has(String(c.id));
                const unread = chatUnreadCounts[String(c.id)] || 0;
                const isTypingNow = otherUserTyping && activeChat?.id === c.id;
                
                return (
                  <div 
                    key={c.id} 
                    onClick={() => { setActiveChat(c); setMessages([]); }} 
                    className={`flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all ${activeChat?.id === c.id ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'hover:bg-gray-50'}`}
                  >
                    <div className="relative shrink-0">
                      <img src={getAvatarUrl(c.avatar, c.sender)} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                      {isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className={`text-sm font-black truncate ${activeChat?.id === c.id ? 'text-white' : 'text-gray-900'}`}>{c.sender}</p>
                        <span className={`text-[9px] font-bold ${activeChat?.id === c.id ? 'text-white/60' : 'text-gray-400'}`}>
                          {new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        {isTypingNow ? (
                          <p className={`text-[10px] font-black italic animate-pulse ${activeChat?.id === c.id ? 'text-white/80' : 'text-primary'}`}>Typing...</p>
                        ) : (
                          <p className={`text-xs truncate ${activeChat?.id === c.id ? 'text-white/80' : 'text-gray-500'}`}>{c.lastMessage}</p>
                        )}
                        {unread > 0 && <span className="shrink-0 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white/20">{unread}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white relative overflow-hidden`}>
        {activeChat ? (
          <>
            <header className="p-4 md:p-6 border-b border-gray-50 flex items-center justify-between bg-white/30 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3 md:gap-4">
                <button onClick={() => setActiveChat(null)} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-primary transition-colors"><ArrowLeft className="w-5 h-5" /></button>
                <div className="relative">
                  <img src={getAvatarUrl(activeChat.avatar, activeChat.sender)} className="w-10 h-10 md:w-12 md:h-12 rounded-2xl object-cover shadow-sm" />
                  {onlineUsers.has(String(activeChat.id)) && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />}
                </div>
                <div>
                  <Link to={`/user/${encodeURIComponent(activeChat.sender)}`} className="text-sm md:text-base font-black text-gray-900 hover:text-primary transition-colors block leading-none">{activeChat.sender}</Link>
                  <div className="flex items-center gap-1.5 mt-1">
                    {otherUserTyping ? (
                      <span className="text-[9px] font-black text-primary animate-pulse uppercase tracking-widest">Typing...</span>
                    ) : (
                      <span className={`text-[9px] font-black uppercase tracking-widest ${onlineUsers.has(String(activeChat.id)) ? 'text-emerald-500' : 'text-gray-400'}`}>
                        {onlineUsers.has(String(activeChat.id)) ? 'Online' : 'Offline'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tight">End-to-End</span>
                </div>
                <div className="relative">
                  <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-gray-100" onClick={() => setIsMenuOpen(!isMenuOpen)}><MoreVertical className="w-5 h-5 text-gray-400" /></Button>
                  <AnimatePresence>
                    {isMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 shadow-2xl rounded-2xl py-2 z-20 overflow-hidden">
                          <Link to={`/user/${encodeURIComponent(activeChat.sender)}`} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"><User className="w-4 h-4 text-gray-400" /> View Profile</Link>
                          <button onClick={handleDeleteConversation} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-400" /> Delete Conversation</button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </header>

            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/40 relative no-scrollbar">
              <ChatWallpaper />
              
              <div className="relative z-10 space-y-6">
                {loadingHistory ? (
                  <div className="h-full flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                    <Clock className="w-10 h-10 mb-2" />
                    <p className="text-sm font-bold">No messages yet</p>
                  </div>
                ) : (
                  messages.map((m, i) => {
                    const isMe = String(m.senderId) === String(user._id || user.id);
                    const prevMsg = i > 0 ? messages[i - 1] : null;
                    const isNewDay = !prevMsg || new Date(m.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
                    const isConsecutive = prevMsg && String(prevMsg.senderId) === String(m.senderId) && !isNewDay;

                    return (
                      <React.Fragment key={m._id || i}>
                        {isNewDay && (
                          <div className="flex justify-center my-8">
                            <span className="px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm">
                              {formatMessageDate(m.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'} group`}>
                          <div className={`max-w-[85%] md:max-w-[70%] space-y-1 relative`}>
                            {isMe && !m.isDeleted && (
                              <button 
                                onClick={() => handleDeleteMessage(m._id)} 
                                className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            
                            <div className={`
                              relative p-3 md:p-4 shadow-sm text-[13px] md:text-sm leading-relaxed 
                              ${m.isDeleted ? 'bg-gray-100 text-gray-400 italic rounded-2xl' : (
                                isMe 
                                  ? `bg-[#DCF8C6] text-gray-800 ${isConsecutive ? 'rounded-2xl' : 'rounded-2xl rounded-tr-none'} border border-[#d1e9ba] font-medium` 
                                  : `bg-white text-gray-900 ${isConsecutive ? 'rounded-2xl' : 'rounded-2xl rounded-tl-none'} border border-gray-100 font-medium`
                              )}
                            `}>
                              {m.imageUrl && !m.isDeleted && (
                                <div className="rounded-xl overflow-hidden mb-2 border border-black/5">
                                  <img 
                                    src={m.imageUrl} 
                                    className="max-h-80 w-full object-cover cursor-pointer hover:opacity-95 transition-opacity" 
                                    onClick={() => window.open(m.imageUrl, '_blank')} 
                                    alt="Sent image"
                                  />
                                </div>
                              )}
                              {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
                              
                              <div className={`flex items-center gap-1.5 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <span className={`text-[9px] font-bold uppercase tracking-tight ${isMe ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </span>
                                {isMe && !m.isDeleted && (
                                  <CheckCheck className={`w-3.5 h-3.5 ${m.read ? 'text-[#34B7F1]' : 'text-gray-400'}`} />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            </div>

            <footer className="p-4 bg-white border-t border-gray-50">
              <div className="flex gap-2 md:gap-3 items-end">
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) { const r = new FileReader(); r.onloadend = () => sendMessage('', r.result); r.readAsDataURL(file); } }} />
                <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 border border-gray-100 shrink-0"><ImageIcon className="w-5 h-5" /></button>
                <div className="flex-1 relative">
                  <textarea value={messageInput} onChange={handleTypingIndicator} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(messageInput); } }} placeholder="Type a message..." className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all resize-none max-h-32 min-h-[48px]" rows={1} />
                  <Button onClick={() => sendMessage(messageInput)} disabled={!messageInput.trim()} className="absolute right-2 bottom-1.5 h-8 w-8 p-0 rounded-xl shadow-lg shadow-primary/20"><Send className="w-4 h-4" /></Button>
                </div>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/20">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-gray-200/50 flex items-center justify-center mb-6 border border-gray-50"><MessageSquare className="w-10 h-10 text-primary" /></div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">UniKart Messenger</h3>
            <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto font-bold uppercase tracking-widest text-[10px]">Select a student from the inbox to start trading securely.</p>
          </div>
        )}
      </main>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative z-10 flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-gray-900">New Chat</h3>
                <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                  value={searchQuery} 
                  onChange={(e) => handleUserSearch(e.target.value)} 
                  placeholder="Search students..." 
                  className="h-14 pl-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white text-gray-900" 
                  autoFocus
                />
              </div>
              <div className="flex-1 max-h-[400px] overflow-y-auto space-y-2 no-scrollbar">
                {searching ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Searching Campus...</p>
                  </div>
                ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                  <div className="text-center py-12 text-gray-400 italic text-sm">No students found matching "{searchQuery}"</div>
                ) : searchResults.map(u => (
                  <div 
                    key={u._id} 
                    onClick={() => startNewChat(u)} 
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-100 transition-all"
                  >
                    <img src={getAvatarUrl(u.avatar, u.name)} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                    <div>
                      <p className="text-sm font-black text-gray-900">{u.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{u.college || 'UniKart Verified'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
