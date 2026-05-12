const express = require('express');
const { 
  register, 
  login, 
  getProfile,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

router.get('/profile', protect, getProfile);

module.exports = router;
