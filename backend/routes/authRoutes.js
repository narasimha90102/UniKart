const express = require('express');
const { 
  register, 
  login, 
  getProfile,
  forgotPassword,
  resetPassword,
  validateEmail,
  verifyOtp
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/validate-email', validateEmail);
router.post('/verify-otp', verifyOtp);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

router.get('/profile', protect, getProfile);

module.exports = router;
