const crypto = require('crypto');
const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { otpTemplate, approvalPendingTemplate, welcomeTemplate } = require('../utils/emailTemplates');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new user (and generate OTP)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, regNo, department, college } = req.body;

    if (!name || !email || !password || !regNo) {
      return res.status(400).json({ success: false, message: 'Please provide all required student details (Name, Email, Reg No, Password)' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({ success: false, message: 'Email already registered. Please login.' });
      } else {
        // User exists but not verified, update OTP and redirect
        const otp = process.env.NODE_ENV === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000);
        
        userExists.otp = otp;
        userExists.otpExpire = otpExpire;
        await userExists.save();
        console.log(`[DEBUG] OTP for ${userExists.email}: ${otp}`);

        sendEmail({
          email: userExists.email,
          subject: 'UniKart Student Verification Code',
          html: otpTemplate(otp)
        }).catch(err => console.error('Email send failed:', err));


        return res.status(200).json({
          success: true,
          isPending: true,
          message: 'Account pending verification. New OTP sent.',
          userId: userExists._id
        });
      }
    }

    const regNoExists = await User.findOne({ regNo });
    if (regNoExists) {
      return res.status(400).json({ success: false, message: 'Register Number already exists.' });
    }

    // Generate OTP
    const otp = process.env.NODE_ENV === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      password,
      regNo,
      department,
      college,
      isVerified: false,
      status: 'pending_otp',
      otp,
      otpExpire
    });

    console.log(`[DEBUG] Registration OTP for ${user.email}: ${otp}`);

    // Send OTP Email (Non-blocking for faster response)
    sendEmail({
      email: user.email,
      subject: 'UniKart Student Verification Code',
      html: otpTemplate(otp)
    }).catch(err => console.error('Email send failed:', err));


    return res.status(201).json({
      success: true,
      message: process.env.NODE_ENV === 'development' 
        ? `OTP sent to your email (Dev Mode: Use ${otp})` 
        : 'OTP sent to your email. Please verify to continue.',
      userId: user._id,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyOtp = async (req, res, next) => {
  try {
    const { userId, email, otp } = req.body;

    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.status = 'pending_approval'; // Move to admin approval stage
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. Your account is now waiting for administrator approval.',
      status: 'pending_approval'
    });

    // Notify user about approval status
    sendEmail({
      email: user.email,
      subject: 'UniKart Identity Verified',
      html: approvalPendingTemplate()
    }).catch(err => console.error('Approval notification failed:', err));

  } catch (error) {
    next(error);
  }
};

// @desc    Resend Email OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified && user.status !== 'pending_otp') {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    // Generate new OTP
    const otp = process.env.NODE_ENV === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();
    console.log(`[DEBUG] Resend OTP for ${user.email}: ${otp}`);

    // Send OTP Email (Non-blocking)
    sendEmail({
      email: user.email,
      subject: 'UniKart Student Verification Code (Resent)',
      html: otpTemplate(otp)
    }).catch(err => console.error('Email send failed:', err));

    res.status(200).json({
      success: true,
      message: process.env.NODE_ENV === 'development'
        ? `A new verification code has been sent (Dev Mode: Use ${otp})`
        : 'A new verification code has been sent to your email.',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {

    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verification Logic
    if (user.status === 'pending_otp') {
      return res.status(401).json({ 
        success: false, 
        message: 'Please verify your student email first.', 
        userId: user._id,
        status: 'pending_otp' 
      });
    }

    if (user.status === 'pending_approval') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your registration is waiting for campus administrator approval.',
        status: 'pending_approval'
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your registration request was rejected by the campus admin. Please contact support.',
        status: 'rejected'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended for violating campus policies.' });
    }

    // Only allow 'approved' or 'admin' to login
    // Note: Admins are approved by default or handled separately
    if (user.status !== 'approved' && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Account not approved.' });
    }

    // Record login history
    await LoginHistory.create({
      user: user._id,
      ip: req.ip,
      device: req.headers['user-agent']
    });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        regNo: user.regNo,
        department: user.department
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save({ validateBeforeSave: false });

    // In a real application, send the token via email
    console.log(`[MOCK EMAIL] To: ${user.email} | Subject: Password Reset | Token: ${resetToken}`);

    res.status(200).json({ success: true, message: 'Password reset token generated and sent to email (mocked in console)' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
