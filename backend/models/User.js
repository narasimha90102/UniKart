const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide your university email'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false // Securely hide password from queries by default
    },
    regNo: {
      type: String,
      required: [true, 'Register Number is required for student verification'],
      unique: true,
      trim: true,
      uppercase: true
    },
    department: {
      type: String,
      trim: true
    },
    college: {
      type: String,
      trim: true
    },
    phoneNumber: {
      type: String,
      trim: true,
      maxlength: [15, 'Phone number cannot exceed 15 characters']
    },
    bio: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: 'default-avatar.png' // URL or file path
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    status: {
      type: String,
      enum: ['pending_otp', 'pending_approval', 'approved', 'rejected', 'suspended'],
      default: 'pending_otp'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    // OTP & Security
    otp: {
      type: String,
      select: false // Hide OTP from normal queries
    },
    otpExpire: {
      type: Date,
      select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    
    // Marketplace Features
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    },
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Product'
      }
    ],
    cart: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product'
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1
        }
      }
    ],
    // Privacy & Notification Preferences
    privacy: {
      publicProfile: { type: Boolean, default: true },
      showPhone: { type: Boolean, default: true },
      showEmail: { type: Boolean, default: false },
      showOnline: { type: Boolean, default: true },
    },
    notifPrefs: {
      messages: { type: Boolean, default: true },
      orders: { type: Boolean, default: true },
      deals: { type: Boolean, default: true },
      reviews: { type: Boolean, default: true },
      pushEnabled: { type: Boolean, default: true },
      emailDigest: { type: Boolean, default: false },
    },
    twoFA: { type: Boolean, default: false },
    addresses: { type: Array, default: [] },
    paymentMethods: { type: Array, default: [] },
    lastLogin: Date,
    verifiedAt: Date
  },
  { 
    timestamps: true, // Automatically manages createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

