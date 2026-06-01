const Order = require('../models/Order');

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('product', 'title images price')
      .populate('seller', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const order = await Order.create(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user payments (both sent and received)
// @route   GET /api/orders/my-payments
// @access  Private
exports.getMyPayments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Payments made (purchases)
    const purchases = await Order.find({ user: userId })
      .populate('product', 'title images price')
      .populate('seller', 'name email')
      .sort('-createdAt');

    // Payments received (sales)
    const sales = await Order.find({ seller: userId })
      .populate('product', 'title images price')
      .populate('user', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: {
        purchases,
        sales
      }
    });
  } catch (error) {
    next(error);
  }
};
