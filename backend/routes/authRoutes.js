const express = require('express');
const rateLimit = require('express-rate-limit');
const { 
  register, 
  login, 
  getProfile,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  validateEmail,
  verifyOtp,
  googleLogin
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Rate limiter: 5 requests per 15 minutes per IP
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many password reset requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/validate-email', validateEmail);
router.post('/verify-otp', verifyOtp);
router.post('/forgotpassword', forgotPasswordLimiter, forgotPassword);
router.get('/resetpassword/:resettoken', verifyResetToken);
router.put('/resetpassword/:resettoken', resetPassword);

router.get('/profile', protect, getProfile);

module.exports = router;
