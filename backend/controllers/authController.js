const crypto = require('crypto');
const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { otpTemplate, approvalPendingTemplate, welcomeTemplate } = require('../utils/emailTemplates');
const dns = require('dns').promises;
const validator = require('validator');

// Helper to validate email professionally (graceful MX check + disposable checker + database duplicates)
const verifyEmailUtility = async (email, checkDatabase = true) => {
  try {
    if (!email || !validator.isEmail(email)) {
      return { success: false, message: 'Please enter a valid email address' };
    }

    const domain = email.split('@')[1];

    // 1. DNS/MX Check (graceful warning, falls back to SMTP delivery for real check)
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        console.warn(`[ValidateEmail] MX lookup resolved empty records for domain ${domain}.`);
      }
    } catch (dnsErr) {
      console.warn(`[ValidateEmail] DNS lookup failed for domain ${domain}: ${dnsErr.message}. Fallback to live SMTP OTP dispatch verification.`);
    }

    // 2. Disposable/Fake email check
    const disposableDomains = [
      'mailinator.com', '10minutemail.com', 'tempmail.com', 'yopmail.com', 
      'sharklasers.com', 'guerrillamail.com', 'dispostable.com', 'getairmail.com',
      'burnermail.io', 'trashmail.com', 'temp-mail.org', 'tempmailaddress.com'
    ];
    if (disposableDomains.includes(domain.toLowerCase())) {
      return { success: false, message: 'Email address is not available' };
    }

    const fakeKeywords = ['fake', 'test', 'dummy', 'spam', 'example'];
    const username = email.split('@')[0].toLowerCase();
    if (fakeKeywords.some(kw => username.includes(kw)) && (domain === 'gmail.com' || domain === 'yahoo.com' || domain === 'outlook.com')) {
      return { success: false, message: 'Email address is not available' };
    }

    // 3. Database Duplicate check bypassed as requested
    // (Email exist check is removed)

    return { success: true, message: 'Valid email' };
  } catch (err) {
    console.error('[verifyEmailUtility] Unexpected exception:', err);
    return { success: false, message: 'Server error, please try again' };
  }
};

// @desc    Validate Email address and dispatch dynamic 6-digit OTP via Gmail SMTP
// @route   POST /api/auth/validate-email
// @access  Public
exports.validateEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(`[AuthController] Validate-email and OTP dispatch requested for: ${email}`);
    
    // Validate format, duplicates, and fake checks
    const result = await verifyEmailUtility(email, true);
    if (!result.success) {
      console.warn(`[AuthController] Email check rejected: ${result.message}`);
      return res.status(400).json({ success: false, message: result.message });
    }

    // Generate secure 6-digit verification code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[AuthController] Generated OTP: ${otpCode} for email: ${email}`);

    // Store temporarily in MongoDB
    const OTP = require('../models/OTP');
    await OTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send via Gmail SMTP (using Nodemailer)
    try {
      await sendEmail({
        email: email.toLowerCase(),
        subject: 'UniKart Account Verification Code',
        message: `Your verification code is ${otpCode}. This code is valid for 10 minutes.`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; max-width: 500px; margin: auto; border: 1px solid #eef2f6; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
            <h2 style="color: #6366f1; text-align: center; font-weight: 800; font-size: 24px; margin-bottom: 20px; letter-spacing: -0.5px;">Verify Your Email</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">Thank you for registering at UniKart! Please enter the following 6-digit verification code to complete your signup process:</p>
            <div style="font-size: 36px; font-weight: 900; letter-spacing: 6px; padding: 20px; background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 18px; text-align: center; margin: 25px 0; color: #111827;">
              ${otpCode}
            </div>
            <p style="font-size: 13px; color: #ef4444; font-weight: bold; text-align: center;">This OTP is valid for 10 minutes.</p>
            <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0;" />
            <p style="font-size: 11px; color: #9ca3af; text-align: center; line-height: 1.4;">If you did not initiate this request, please safely ignore this communication.</p>
          </div>
        `
      });
      
      console.log(`[AuthController] OTP dispatched successfully to: ${email}`);
      return res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (mailErr) {
      console.error('[AuthController] Nodemailer SMTP failed to send OTP:', mailErr.message);
      // Clean up the unsent OTP document
      await OTP.deleteOne({ email: email.toLowerCase() });
      return res.status(400).json({ success: false, message: 'Email address is not available' });
    }
  } catch (error) {
    console.error('[AuthController] Error in validateEmail:', error);
    return res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new user (direct student register waiting for admin approval)
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

    // Run format validation and fake email check
    const emailVerify = await verifyEmailUtility(email, false);
    if (!emailVerify.success) {
      return res.status(400).json({ success: false, message: emailVerify.message });
    }

    const regNoExists = await User.findOne({ regNo });
    if (regNoExists) {
      return res.status(400).json({ success: false, message: 'Register Number already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      regNo,
      department: department || '',
      college: college || 'University Campus',
      isVerified: false,
      status: 'pending_approval'
    });

    return res.status(201).json({
      success: true,
      message: 'Account created! Your registration is waiting for administrator approval.',
      userId: user._id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    console.log(`[AuthController] OTP verification request received for: ${email}, OTP: ${otp}`);
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide both email and OTP' });
    }

    const OTP = require('../models/OTP');
    const otpRecord = await OTP.findOne({ email: email.toLowerCase(), otp });

    if (!otpRecord) {
      console.warn(`[AuthController] OTP verification failed: Code matches nothing for ${email}`);
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    console.log(`[AuthController] OTP verified successfully for: ${email}`);
    return res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('[AuthController] Error in verifyOtp:', error);
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    console.log('[AuthController] Login request received');
    const { email, password } = req.body;

    // 1. Check for missing email or password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    // Clean email input (trim whitespace and convert to lowercase)
    const cleanedEmail = email.trim().toLowerCase();

    // 2. Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(cleanedEmail)) {
      console.warn(`[AuthController] Login failed: Invalid email format (${cleanedEmail})`);
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    // 3. Check for user in Database
    console.log(`[AuthController] Checking if user exists in MongoDB for: ${cleanedEmail}`);
    const user = await User.findOne({ email: cleanedEmail }).select('+password');
    if (!user) {
      console.warn(`[AuthController] Login failed: User does not exist (${email})`);
      return res.status(401).json({ success: false, message: 'User does not exist' });
    }

    // 4. Verify password
    console.log('[AuthController] Verifying password...');
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.warn(`[AuthController] Login failed: Incorrect password for user (${email})`);
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // 5. Evaluate Account Status
    console.log(`[AuthController] Checking account status for: ${user.status}`);
    
    if (user.status === 'pending_approval') {
      return res.status(403).json({ 
        success: false, 
        message: 'Account disabled. Pending administrator approval.',
        status: 'pending_approval'
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ 
        success: false, 
        message: 'Account disabled. Your registration request was rejected.',
        status: 'rejected'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ 
        success: false, 
        message: 'Account disabled. Your account has been suspended.' 
      });
    }

    // Only allow 'approved' or 'admin' to login
    if (user.status !== 'approved' && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Account disabled. Access not approved.' });
    }

    // 6. Record login history
    console.log('[AuthController] Recording login history...');
    await LoginHistory.create({
      user: user._id,
      ip: req.ip,
      device: req.headers['user-agent']
    });

    console.log('[AuthController] Login successful! Generating JWT token.');
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
        department: user.department,
        status: user.status,
        isVerified: user.isVerified,
        avatar: user.avatar,
        phoneNumber: user.phoneNumber,
        bio: user.bio,
        wishlist: user.wishlist,
        ratings: user.ratings,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('[AuthController] Login Exception Caught:', error);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
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

// @desc    Validate Google access token and sign in / register
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
  try {
    const { access_token, mode = 'login' } = req.body;

    if (!access_token) {
      return res.status(400).json({ success: false, message: 'Please provide a Google access token.' });
    }

    // 1. Fetch user profile from Google's UserInfo API using the access token
    console.log('[AuthController] Verifying Google access token with Google UserInfo API...');
    const googleUserRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
    
    if (!googleUserRes.ok) {
      console.warn('[AuthController] Google token verification failed. Status:', googleUserRes.status);
      return res.status(400).json({ success: false, message: 'Invalid or expired Google access token.' });
    }

    const googleUser = await googleUserRes.json();
    const { sub: googleId, email, name, picture: avatar } = googleUser;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Could not retrieve email from Google profile.' });
    }

    console.log(`[AuthController] Google token verified. Email: ${email}, Name: ${name}, Mode: ${mode}`);

    // Check if user already exists in DB by Google ID or by Email
    let user = await User.findOne({ 
      $or: [
        { googleId },
        { email: email.toLowerCase() }
      ]
    });

    if (mode === 'signup') {
      // GOOGLE SIGN UP FLOW
      if (user) {
        return res.status(400).json({ 
          success: false, 
          message: 'Account already exists. Please go to the login page to sign in.' 
        });
      }

      // Create new pending account
      console.log(`[AuthController] Creating new pending Google account for ${email}...`);
      const crypto = require('crypto');
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const regNo = `G-${Math.floor(10000000 + Math.random() * 90000000)}`;

      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: randomPassword,
        regNo,
        googleId,
        avatar: avatar || 'default-avatar.png',
        signupMethod: 'google',
        accountStatus: 'pending',
        isApproved: false,
        status: 'pending_approval', // For backward compatibility with verification dashboard queries
        isVerified: false
      });

      return res.status(201).json({
        success: true,
        message: 'Your account has been created successfully. Your account is currently under review by the UniKart team. You will be able to log in once your account is approved.',
        status: 'pending_approval'
      });

    } else {
      // GOOGLE LOGIN FLOW
      // CASE 1: NEW USER
      if (!user) {
        return res.status(404).json({
          success: false,
          code: 'ACCOUNT_NOT_FOUND',
          message: 'Account not found. Please create an account first.'
        });
      }

      // If user exists by email but doesn't have googleId linked yet, link it now
      if (!user.googleId) {
        user.googleId = googleId;
        user.signupMethod = 'google';
      }

      // Refresh Google avatar if changed
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
      }
      await user.save();

      // CASE 2: PENDING APPROVAL
      if (user.status === 'pending_approval' || user.accountStatus === 'pending') {
        return res.status(403).json({
          success: false,
          code: 'ACCOUNT_PENDING',
          message: 'Your account is awaiting admin approval. You will be able to log in after approval.'
        });
      }

      // CASE 3: REJECTED
      if (user.status === 'rejected' || user.accountStatus === 'rejected') {
        return res.status(403).json({
          success: false,
          code: 'ACCOUNT_REJECTED',
          message: 'Your account request was not approved. Please contact support for assistance.'
        });
      }

      // Other constraints (e.g. suspended)
      if (user.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Account disabled. Your account has been suspended.'
        });
      }

      // CASE 4: APPROVED & SUCCESSFUL LOGIN
      // Record login history
      const LoginHistory = require('../models/LoginHistory');
      await LoginHistory.create({
        user: user._id,
        ip: req.ip,
        device: req.headers['user-agent']
      });

      console.log('[AuthController] Google login successful. Generating JWT token.');

      return res.status(200).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          college: user.college,
          regNo: user.regNo,
          department: user.department,
          status: user.status,
          isVerified: user.isVerified,
          avatar: user.avatar,
          wishlist: user.wishlist,
          createdAt: user.createdAt
        }
      });
    }
  } catch (error) {
    console.error('[AuthController] Exception in googleLogin:', error);
    return res.status(500).json({ success: false, message: 'Server error during Google authentication.' });
  }
};
