const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all conversations for a user
// @route   GET /api/chat/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ createdAt: -1 });

    const contactsMap = new Map();

    for (const msg of messages) {
      const otherUserId = msg.sender.toString() === userId
        ? msg.receiver.toString()
        : msg.sender.toString();

      // Skip self-messages
      if (otherUserId === userId) continue;

      if (!contactsMap.has(otherUserId)) {
        const otherUser = await User.findById(otherUserId).select('name avatar lastSeen');
        if (otherUser) {
          contactsMap.set(otherUserId, {
            id: otherUserId,
            sender: otherUser.name,
            avatar: otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=1B8C50&color=fff`,
            lastMessage: msg.content || 'Image attached',
            time: msg.createdAt,
            unread: msg.receiver.toString() === userId && !msg.read ? 1 : 0,
            lastSeen: otherUser.lastSeen
          });
        }
      } else {
        if (msg.receiver.toString() === userId && !msg.read) {
          contactsMap.get(otherUserId).unread += 1;
        }
      }
    }

    const contacts = Array.from(contactsMap.values());

    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get message history for a room
// @route   GET /api/chat/history/:room
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const room = req.params.room;
    const [user1, user2] = room.split('-');

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ createdAt: 1 });

    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      senderId: msg.sender,
      receiverId: msg.receiver,
      content: msg.content,
      imageUrl: msg.imageUrl,
      room: room,
      createdAt: msg.createdAt,
      read: msg.read,
      isDeleted: msg.isDeleted
    }));

    res.status(200).json({ success: true, data: formattedMessages });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all messages in a chat as read + clear related notifications
// @route   PUT /api/chat/mark-read/:otherUserId
// @access  Private
exports.markChatAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;

    // Mark all unread messages from otherUser to me as read
    await Message.updateMany(
      { sender: otherUserId, receiver: userId, read: false },
      { $set: { read: true } }
    );

    // Clear message notifications from this sender
    await Notification.deleteMany({
      user: userId,
      senderId: otherUserId,
      type: 'message'
    });

    // Recompute unread totals
    const totalUnreadMessages = await Message.countDocuments({
      receiver: userId,
      read: false
    });

    const unreadNotifications = await Notification.countDocuments({
      user: userId,
      read: false
    });

    res.status(200).json({
      success: true,
      totalUnreadMessages,
      unreadNotifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get total unread message count
// @route   GET /api/chat/unread-count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalUnreadMessages = await Message.countDocuments({
      receiver: userId,
      read: false
    });

    res.status(200).json({ success: true, totalUnreadMessages });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a message
// @route   DELETE /api/chat/message/:id
// @access  Private
exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this message' });
    }

    message.isDeleted = true;
    message.content = 'This message was deleted';
    message.imageUrl = null;
    await message.save();

    res.status(200).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete entire conversation
// @route   DELETE /api/chat/conversation/:otherUserId
// @access  Private
exports.deleteConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;

    await Message.deleteMany({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    });

    await Notification.deleteMany({
      user: userId,
      senderId: otherUserId,
      type: 'message'
    });

    res.status(200).json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    next(error);
  }
};
