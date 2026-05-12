const express = require('express');
const { 
  rateUser, 
  getUser, 
  toggleWishlist, 
  addToCart, 
  removeFromCart, 
  getCart,
  updateProfile,
  updatePassword
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/cart')
  .get(protect, getCart)
  .post(protect, addToCart);

router.delete('/cart/:productId', protect, removeFromCart);

router.post('/wishlist/:productId', protect, toggleWishlist);
router.put('/profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);
router.get('/:id', getUser);
router.post('/:id/rate', protect, rateUser);

module.exports = router;
