const crypto = require('crypto');
const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const dns = require('dns').promises;
const validator = require('validator');

// Helper to validate email professionally (graceful MX check + disposable checker)
const verifyEmailUtility = async (email, checkDatabase = true) => {
  try {
    if (!email || !validator.isEmail(email)) {
      return { success: false, message: 'Please enter a valid email address' };
    }

    const domain = email.split('@')[1];

    // 1. DNS/MX Check (graceful warning)
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        console.warn(`[ValidateEmail] MX lookup resolved empty records for domain ${domain}.`);
      }
    } catch (dnsErr) {
      console.warn(`[ValidateEmail] DNS lookup failed for domain ${domain}: ${dnsErr.message}.`);
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

    return { success: true, message: 'Valid email' };
  } catch (err) {
    console.error('[verifyEmailUtility] Unexpected exception:', err);
    return { success: false, message: 'Server error, please try again' };
  }
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Validate Email address and dispatch dynamic 6-digit OTP
// @route   POST /api/auth/validate-email
// @access  Public
exports.validateEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(`[AuthController] Validate-email and OTP dispatch requested for: ${email}`);

    const result = await verifyEmailUtility(email, true);
    if (!result.success) {
      console.warn(`[AuthController] Email check rejected: ${result.message}`);
      return res.status(400).json({ success: false, message: result.message });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[AuthController] Generated OTP: ${otpCode} for email: ${email}`);

    const OTP = require('../models/OTP');
    await OTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, new: true }
    );

    try {
      await sendEmail({
        email: email.toLowerCase(),
        subject: 'UniKart Account Verification Code',
        message: `Your verification code is ${otpCode}. This code is valid for 10 minutes.`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; max-width: 500px; margin: auto; border: 1px solid #eef2f6; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
            <h2 style="color: #6366f1; text-align: center; font-weight: 800; font-size: 24px; margin-bottom: 20px;">Verify Your Email</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">Thank you for registering at UniKart! Please enter the following 6-digit verification code:</p>
            <div style="font-size: 36px; font-weight: 900; letter-spacing: 6px; padding: 20px; background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 18px; text-align: center; margin: 25px 0; color: #111827;">
              ${otpCode}
            </div>
            <p style="font-size: 13px; color: #ef4444; font-weight: bold; text-align: center;">This OTP is valid for 10 minutes.</p>
            <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0;" />
            <p style="font-size: 11px; color: #9ca3af; text-align: center;">If you did not initiate this request, please safely ignore this email.</p>
          </div>
        `
      });

      console.log(`[AuthController] OTP dispatched successfully to: ${email}`);
      return res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (mailErr) {
      console.error('[AuthController] Email send failed:', mailErr.message);
      await OTP.deleteOne({ email: email.toLowerCase() });
      return res.status(400).json({ success: false, message: 'Email address is not available' });
    }
  } catch (error) {
    console.error('[AuthController] Error in validateEmail:', error);
    return res.status(500).json({ success: false, message: 'Server error, please try again' });
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
      console.warn(`[AuthController] OTP verification failed for ${email}`);
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    console.log(`[AuthController] OTP verified successfully for: ${email}`);
    return res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('[AuthController] Error in verifyOtp:', error);
    next(error);
  }
};

// @desc    Register a new user
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

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    console.log('[AuthController] Login request received');
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const cleanedEmail = email.trim().toLowerCase();

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(cleanedEmail)) {
      console.warn(`[AuthController] Login failed: Invalid email format (${cleanedEmail})`);
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    console.log(`[AuthController] Checking if user exists in MongoDB for: ${cleanedEmail}`);
    const user = await User.findOne({ email: cleanedEmail }).select('+password');
    if (!user) {
      console.warn(`[AuthController] Login failed: User does not exist (${email})`);
      return res.status(401).json({ success: false, message: 'User does not exist' });
    }

    console.log('[AuthController] Verifying password...');
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.warn(`[AuthController] Login failed: Incorrect password for user (${email})`);
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

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

    if (user.status !== 'approved' && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Account disabled. Access not approved.' });
    }

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

// @desc    Forgot Password — generate token & send reset email
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }

    console.log(`[AUTH-AUDIT] Password reset requested for email: ${email.trim().toLowerCase()}`);

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    // Always respond with success to prevent email enumeration attacks
    if (!user) {
      console.warn(`[AuthController] Forgot password: No user found for ${email}. Returning generic response.`);
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }

    console.log("User found:", user.email);

    // Generate a secure 32-byte raw token (sent in email URL only)
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log(`[AUTH-AUDIT] Generated reset token for user ID: ${user._id}`);

    // Store only the HASH in the database — never the raw token
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save({ validateBeforeSave: false });
    console.log(`[AuthController] Hashed token saved. Expires in 15 min. User: ${user.email}`);

    // Dynamically resolve clientUrl based on the request headers to support local dev, LAN, and public tunnel (loca.lt)
    let clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    if (req.headers.origin) {
      clientUrl = req.headers.origin;
    } else if (req.headers.referer) {
      try {
        const parsedReferer = new URL(req.headers.referer);
        clientUrl = parsedReferer.origin;
      } catch (e) {
        // Fallback to config
      }
    }
    if (!clientUrl || clientUrl === 'null') {
      const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      clientUrl = `${protocol}://${req.get('host')}`;
    }

    const resetUrl = `${clientUrl.trim()}/reset-password/${resetToken}`;

    // Professional branded HTML email
    const htmlBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Reset Your UniKart Password</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(99,102,241,0.10);">
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1 0%,#818cf8 100%);padding:36px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">🛒 UniKart</h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:500;">University Campus Marketplace</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px 40px 32px;">
                    <p style="margin:0 0 8px;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Password Reset</p>
                    <h2 style="margin:0 0 16px;color:#111827;font-size:22px;font-weight:800;">Hi ${user.name},</h2>
                    <p style="margin:0 0 28px;color:#4b5563;font-size:15px;line-height:1.7;">
                      We received a request to reset the password for your UniKart account.
                      Click the button below to set a new password. This link is valid for <strong>15 minutes</strong>.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding:0 0 32px;">
                          <a href="${resetUrl}"
                            style="display:inline-block;background:linear-gradient(135deg,#6366f1,#818cf8);color:#ffffff;text-decoration:none;padding:16px 44px;border-radius:14px;font-size:16px;font-weight:800;letter-spacing:0.02em;box-shadow:0 4px 16px rgba(99,102,241,0.35);">
                            Reset My Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0 0 6px;color:#6b7280;font-size:13px;">If the button doesn't work, copy and paste this link:</p>
                    <p style="margin:0 0 28px;word-break:break-all;">
                      <a href="${resetUrl}" style="color:#6366f1;font-size:12px;">${resetUrl}</a>
                    </p>
                    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;">
                      <p style="margin:0;color:#92400e;font-size:13px;font-weight:600;">
                        ⚠️ If you did not request a password reset, you can safely ignore this email.
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #f3f4f6;text-align:center;">
                    <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                      Sent by <strong>UniKart</strong> · University Campus Marketplace<br/>
                      © ${new Date().getFullYear()} UniKart. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      console.log("Sending reset email to:", user.email);
      console.log("SMTP sender:", process.env.FROM_EMAIL);
      await sendEmail({
        email: user.email,
        subject: 'Reset Your UniKart Password',
        message: `Hi ${user.name}, reset your UniKart password here: ${resetUrl} — This link expires in 15 minutes.`,
        html: htmlBody,
      });

      console.log("Reset email successfully sent");
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    } catch (emailErr) {
      console.error(`[AuthController] Email dispatch failed for ${user.email}:`, emailErr.message);
      
      // Print the reset link to the console for easy developer testing
      console.log(`\n=============================================================================`);
      console.log(`🔑 [LOCAL DEV RECOVERY LINK]`);
      console.log(`Email delivery failed, but you can copy and open this URL to reset the password:`);
      console.log(`🔗 ${resetUrl}`);
      console.log(`=============================================================================\n`);

      // Still return 200 OK success to client so the frontend shows the success screen
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }
  } catch (error) {
    console.error('[AuthController] Error in forgotPassword:', error);
    next(error);
  }
};

// @desc    Reset Password — verify token, update password, clear token
// @desc    Verify Reset Password Token
// @route   GET /api/auth/resetpassword/:resettoken
// @access  Public
exports.verifyResetToken = async (req, res, next) => {
  try {
    const { resettoken } = req.params;

    if (!resettoken) {
      return res.status(400).json({ success: false, message: 'Please provide a valid token.' });
    }

    // Hash the incoming raw token to compare with DB
    const resetPasswordToken = crypto.createHash('sha256').update(resettoken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      console.warn('[AUTH-AUDIT] Password reset token verification failed: Invalid or expired token.');
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired.',
      });
    }

    console.log(`[AUTH-AUDIT] Password reset token verified for user ID: ${user._id} (${user.email})`);

    res.status(200).json({
      success: true,
      message: 'Token is valid.',
    });
  } catch (error) {
    console.error('[AuthController] Error in verifyResetToken:', error);
    next(error);
  }
};

// @desc    Reset Password — verify token, update password, clear token
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { resettoken } = req.params;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Please provide a new password.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    console.log(`[AuthController] Password reset attempt with token: ${resettoken?.substring(0, 10)}...`);

    // Hash the incoming raw token to compare with DB
    const resetPasswordToken = crypto.createHash('sha256').update(resettoken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      console.warn('[AuthController] Password reset failed: Invalid or expired token.');
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired. Please request a new one.',
      });
    }

    console.log(`[AuthController] Valid token for user: ${user.email}. Updating password...`);

    // bcrypt hashing is handled by the User model pre-save hook
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log(`[AUTH-AUDIT] Password successfully reset for user ID: ${user._id} (${user.email})`);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('[AuthController] Error in resetPassword:', error);
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

    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }]
    });

    const isAdminEmail = email.toLowerCase() === 'narasimhareddy90102@gmail.com';

    if (mode === 'signup') {
      if (user) {
        return res.status(400).json({
          success: false,
          message: 'Account already exists. Please go to the login page to sign in.'
        });
      }

      console.log(`[AuthController] Creating new Google account for ${email}...`);
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
        accountStatus: isAdminEmail ? 'approved' : 'pending',
        isApproved: isAdminEmail ? true : false,
        status: isAdminEmail ? 'approved' : 'pending_approval',
        role: isAdminEmail ? 'admin' : 'user',
        isVerified: isAdminEmail ? true : false
      });

      if (isAdminEmail) {
        await LoginHistory.create({ user: user._id, ip: req.ip, device: req.headers['user-agent'] });
        console.log('[AuthController] Admin Google signup successful.');
        return res.status(200).json({
          success: true,
          token: generateToken(user._id),
          user: {
            _id: user._id, name: user.name, email: user.email, role: user.role,
            college: user.college, regNo: user.regNo, department: user.department,
            status: user.status, isVerified: user.isVerified, avatar: user.avatar,
            wishlist: user.wishlist, createdAt: user.createdAt
          }
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Your account has been created. It is under review and will be accessible once approved.',
        status: 'pending_approval'
      });

    } else {
      // GOOGLE LOGIN FLOW
      if (!user) {
        return res.status(404).json({
          success: false,
          code: 'ACCOUNT_NOT_FOUND',
          message: 'Account not found. Please create an account first.'
        });
      }

      if (!user.googleId) {
        user.googleId = googleId;
        user.signupMethod = 'google';
      }

      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
      }

      if (isAdminEmail) {
        user.status = 'approved';
        user.accountStatus = 'approved';
        user.isApproved = true;
        user.role = 'admin';
        user.isVerified = true;
      }

      await user.save();

      if (user.status === 'pending_approval' || user.accountStatus === 'pending') {
        return res.status(403).json({
          success: false,
          code: 'ACCOUNT_PENDING',
          message: 'Your account is awaiting admin approval.'
        });
      }

      if (user.status === 'rejected' || user.accountStatus === 'rejected') {
        return res.status(403).json({
          success: false,
          code: 'ACCOUNT_REJECTED',
          message: 'Your account request was not approved. Please contact support.'
        });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Account disabled. Your account has been suspended.'
        });
      }

      await LoginHistory.create({ user: user._id, ip: req.ip, device: req.headers['user-agent'] });
      console.log('[AuthController] Google login successful. Generating JWT token.');

      return res.status(200).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id, name: user.name, email: user.email, role: user.role,
          college: user.college, regNo: user.regNo, department: user.department,
          status: user.status, isVerified: user.isVerified, avatar: user.avatar,
          wishlist: user.wishlist, createdAt: user.createdAt
        }
      });
    }
  } catch (error) {
    console.error('[AuthController] Exception in googleLogin:', error);
    return res.status(500).json({ success: false, message: 'Server error during Google authentication.' });
  }
};
