const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Submit a review and rating
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { orderId, rating, reviewText, images } = req.body;

    if (!orderId || !rating || !reviewText) {
      return res.status(400).json({ success: false, message: 'Please provide orderId, rating and reviewText' });
    }

    const parsedRating = Number(rating);
    if (parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5 stars' });
    }

    // 1. Verify Order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // 2. Only allow reviews if order status is completed (delivered)
    if (order.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Only delivered/completed orders can be reviewed.' });
    }

    // 3. Only allow reviews if buyer purchased the product
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Only the buyer who purchased the product can submit a review.' });
    }

    // 4. Prevent multiple reviews for same order
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this order.' });
    }

    // 5. Save the Review
    const review = await Review.create({
      order: orderId,
      product: order.product,
      buyer: order.user,
      seller: order.seller,
      rating: parsedRating,
      reviewText,
      images: images || []
    });

    // 6. Update Product Review Count
    await Product.findByIdAndUpdate(order.product, { $inc: { reviewCount: 1 } });

    // 7. Update Seller Rating using existing custom formula
    const seller = await User.findById(order.seller);
    if (seller) {
      if (!seller.ratings) {
        seller.ratings = { average: 0, count: 0 };
      }
      let newAverage;
      if (seller.ratings.count === 0) {
        // 1st Product Rating
        newAverage = parsedRating;
      } else {
        // Subsequent ratings using custom formula: ((Current Seller Rating / 2) + (New Product Rating / 2))
        newAverage = (Number(seller.ratings.average) / 2) + (parsedRating / 2);
      }
      
      const averageRounded = Math.round(newAverage * 100) / 100;
      const countUpdated = seller.ratings.count + 1;

      // Safely update database directly, bypassing pre-save hooks & validation constraints
      await User.findByIdAndUpdate(order.seller, {
        $set: {
          'ratings.average': averageRounded,
          'ratings.count': countUpdated
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a seller
// @route   GET /api/reviews/seller/:sellerId
// @access  Public
exports.getSellerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ seller: req.params.sellerId })
      .populate('buyer', 'name avatar')
      .populate('product', 'title images')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if an order has been reviewed
// @route   GET /api/reviews/order/:orderId
// @access  Private
exports.checkOrderReviewStatus = async (req, res, next) => {
  try {
    const review = await Review.findOne({ order: req.params.orderId });
    res.status(200).json({
      success: true,
      reviewed: !!review,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order IDs reviewed by current user
// @route   GET /api/reviews/my-reviewed-orders
// @access  Private
exports.getMyReviewedOrders = async (req, res, next) => {
  try {
    const reviews = await Review.find({ buyer: req.user.id }).select('order');
    const orderIds = reviews.map(r => r.order.toString());
    res.status(200).json({
      success: true,
      data: orderIds
    });
  } catch (error) {
    next(error);
  }
};
