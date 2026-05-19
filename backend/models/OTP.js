const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      trim: true,
      lowercase: true,
      index: true
    },
    otp: {
      type: String,
      required: [true, 'Please provide a 6-digit verification code']
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600 // Automatically delete the document after 10 minutes
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('OTP', OTPSchema);
