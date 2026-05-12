const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['message', 'order', 'system', 'price_drop'],
      default: 'system'
    },
    read: {
      type: Boolean,
      default: false
    },
    senderId: {
      type: String, // ID of the person who sent the message
      default: null
    },
    senderName: {
      type: String,
      default: null
    },
    chatRoom: {
      type: String, // Room ID for deep-linking
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
