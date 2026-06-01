const express = require('express');
const { 
  createReview, 
  getSellerReviews, 
  checkOrderReviewStatus,
  getMyReviewedOrders
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createReview);

router.get('/my-reviewed-orders', protect, getMyReviewedOrders);
router.get('/seller/:sellerId', getSellerReviews);
router.get('/order/:orderId', protect, checkOrderReviewStatus);

module.exports = router;
