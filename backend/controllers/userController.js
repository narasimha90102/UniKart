const User = require('../models/User');

// @desc    Rate a user
// @route   POST /api/users/:id/rate
// @access  Private
exports.rateUser = async (req, res, next) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a valid rating between 1 and 5' });
    }

    const userToRate = await User.findById(req.params.id);

    if (!userToRate) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (userToRate._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot rate yourself' });
    }

    // Calculate new average rating
    const currentTotal = userToRate.ratings.average * userToRate.ratings.count;
    const newCount = userToRate.ratings.count + 1;
    const newAverage = (currentTotal + rating) / newCount;

    userToRate.ratings.average = Math.round(newAverage * 10) / 10;
    userToRate.ratings.count = newCount;

    await userToRate.save();

    res.json({ success: true, data: userToRate.ratings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user info
// @route   GET /api/users/:id
// @access  Public
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const productId = req.params.productId;

    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      // Remove if exists
      user.wishlist.splice(index, 1);
    } else {
      // Add if not exists
      user.wishlist.push(productId);
    }

    await user.save();
    res.json({ success: true, data: user.wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to cart
// @route   POST /api/users/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const user = await User.findById(req.user.id);

    const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

    if (cartItemIndex > -1) {
      // Increase quantity if already in cart
      user.cart[cartItemIndex].quantity += quantity;
    } else {
      // Add new item
      user.cart.push({ product: productId, quantity });
    }

    await user.save();
    res.json({ success: true, data: user.cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/users/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(item => item.product.toString() !== req.params.productId);
    await user.save();
    res.json({ success: true, data: user.cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user cart
// @route   GET /api/users/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    res.json({ success: true, data: user.cart });
  } catch (error) {
    next(error);
  }
};
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phoneNumber, college, bio, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (college) user.college = college;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/users/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update privacy preferences
// @route   PUT /api/users/privacy
// @access  Private
exports.updatePrivacy = async (req, res, next) => {
  try {
    const { privacy } = req.body;
    const user = await User.findById(req.user.id);
    user.privacy = { ...(user.privacy || {}), ...privacy };
    await user.save();
    res.json({ success: true, data: user.privacy });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification preferences
// @route   PUT /api/users/notifications
// @access  Private
exports.updateNotificationPrefs = async (req, res, next) => {
  try {
    const { notifPrefs } = req.body;
    const user = await User.findById(req.user.id);
    user.notifPrefs = { ...(user.notifPrefs || {}), ...notifPrefs };
    await user.save();
    res.json({ success: true, data: user.notifPrefs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get login activity (mocked for now; extend with a LoginLog model later)
// @route   GET /api/users/login-activity
// @access  Private
exports.getLoginActivity = async (req, res, next) => {
  try {
    // In a full implementation this would query a LoginLog collection.
    // For now return the last login timestamp stored on the user.
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: [
        {
          device: 'Web Browser',
          location: 'Unknown',
          time: user.lastLogin || new Date(),
          isCurrent: true,
          success: true,
        },
      ],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate / soft-delete account
// @route   DELETE /api/users/deactivate
// @access  Private
exports.deactivateAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.status = 'suspended';
    await user.save();
    res.json({ success: true, message: 'Account deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};
