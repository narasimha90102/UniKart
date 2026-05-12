const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Centralized store for online users and active rooms
// userId -> Set(socketIds)
const onlineUsers = new Map();
// userId -> Set(rooms)
const activeRooms = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] New connection: ${socket.id}`);

    // Register user as online
    socket.on('register_user', async (userId) => {
      if (!userId) return;
      const uid = String(userId);
      socket.userId = uid;
      
      // Add socket to user's set of active connections
      if (!onlineUsers.has(uid)) {
        onlineUsers.set(uid, new Set());
        // First connection for this user
        socket.broadcast.emit('user_status', { userId: uid, status: 'online' });
      }
      onlineUsers.get(uid).add(socket.id);
      
      console.log(`[Socket] User ${uid} registered with socket ${socket.id}`);
      
      // Send the full list of currently online users to THIS user
      socket.emit('online_users', Array.from(onlineUsers.keys()));

      // Join their own private room for direct notifications
      socket.join(uid);
    });

    // Join a chat room
    socket.on('join_chat', (room) => {
      if (!room) return;
      socket.join(room);
      
      if (socket.userId) {
        if (!activeRooms.has(socket.userId)) {
          activeRooms.set(socket.userId, new Set());
        }
        activeRooms.get(socket.userId).add(room);
      }
      
      console.log(`[Socket] User ${socket.userId} joined room: ${room}`);
    });

    // Leave a chat room
    socket.on('leave_chat', (room) => {
      if (!room) return;
      socket.leave(room);
      
      if (socket.userId && activeRooms.has(socket.userId)) {
        activeRooms.get(socket.userId).delete(room);
      }
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      const { senderId, receiverId, senderName, content, imageUrl, room } = data;
      
      try {
        const newMessage = await Message.create({
          sender: senderId,
          receiver: receiverId,
          content: content || '',
          imageUrl: imageUrl || null
        });

        const payload = {
          _id: newMessage._id,
          senderId,
          receiverId,
          senderName,
          content: newMessage.content,
          imageUrl: newMessage.imageUrl,
          room,
          read: false,
          createdAt: newMessage.createdAt
        };

        io.to(room).emit('receive_message', payload);

        const rId = String(receiverId);
        const isReceiverInRoom = activeRooms.get(rId)?.has(room);

        if (!isReceiverInRoom) {
          // Push to all active sockets of the receiver
          const receiverSockets = onlineUsers.get(rId);
          if (receiverSockets) {
            receiverSockets.forEach(sId => {
              io.to(sId).emit('new_message_alert', payload);
            });
          }

          // Create notification
          const notification = await Notification.create({
            user: receiverId,
            senderId: senderId,
            senderName: senderName,
            chatRoom: room,
            title: 'New Message',
            message: content ? `${senderName}: ${content.substring(0, 50)}...` : `${senderName} sent an image`,
            type: 'message'
          });

          if (receiverSockets) {
            receiverSockets.forEach(sId => {
              io.to(sId).emit('new_notification', notification);
            });
          }
        } else {
          newMessage.read = true;
          await newMessage.save();
          io.to(room).emit('messages_seen', { 
            messageIds: [newMessage._id], 
            readerId: receiverId,
            room 
          });
        }
      } catch (err) {
        console.error('[Socket] Send message error:', err);
      }
    });

    socket.on('mark_seen', async ({ messageIds, room, senderId }) => {
      if (!messageIds?.length) return;
      try {
        await Message.updateMany({ _id: { $in: messageIds } }, { $set: { read: true } });
        socket.to(room).emit('messages_seen', { messageIds, readerId: socket.userId, room });
      } catch (err) { console.error(err); }
    });

    socket.on('typing', (data) => socket.to(data.room).emit('typing', data));
    socket.on('stop_typing', (data) => socket.to(data.room).emit('stop_typing', data));
    socket.on('delete_message', (data) => socket.to(data.room).emit('message_deleted', data));

    socket.on('disconnect', async () => {
      if (socket.userId) {
        const uid = socket.userId;
        const userSockets = onlineUsers.get(uid);
        
        if (userSockets) {
          userSockets.delete(socket.id);
          
          if (userSockets.size === 0) {
            // Last connection closed
            onlineUsers.delete(uid);
            activeRooms.delete(uid);

            const now = new Date();
            try { await User.findByIdAndUpdate(uid, { lastSeen: now }); } catch (err) {}
            io.emit('user_status', { userId: uid, status: 'offline', lastSeen: now });
          }
        }
      }
    });
  });
};
