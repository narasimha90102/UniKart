const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    ip: String,
    device: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
