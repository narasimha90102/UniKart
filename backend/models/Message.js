const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: false
    },
    imageUrl: {
      type: String,
      required: false
    },
    read: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedFor: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }],
    isOrderRequest: {
      type: Boolean,
      default: false
    },
    orderProduct: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
    },
    orderPrice: {
      type: Number
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    isReviewRequest: {
      type: Boolean,
      default: false
    },
    reviewOrderId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Order'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
