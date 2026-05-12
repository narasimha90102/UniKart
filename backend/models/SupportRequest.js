const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'replied', 'closed'],
      default: 'pending'
    },
    adminResponse: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
