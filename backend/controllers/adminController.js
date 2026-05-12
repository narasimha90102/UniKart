const User = require('../models/User');
const Product = require('../models/Product');
const LoginHistory = require('../models/LoginHistory');
const SupportRequest = require('../models/SupportRequest');
const sendEmail = require('../utils/sendEmail');
const { welcomeTemplate } = require('../utils/emailTemplates');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (suspend/active)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a user
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, college } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      college: college || 'University Campus',
      isVerified: true
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, status } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Optional: Delete user's products
    await Product.deleteMany({ seller: req.params.id });
    
    await user.deleteOne();

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products (including moderated/sold)
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('seller', 'name email');
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all login history
// @route   GET /api/admin/login-history
// @access  Private/Admin
exports.getLoginHistory = async (req, res, next) => {
  try {
    const history = await LoginHistory.find().populate('user', 'name email role').sort('-timestamp');
    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all support requests
// @route   GET /api/admin/support
// @access  Private/Admin
exports.getSupportRequests = async (req, res, next) => {
  try {
    const requests = await SupportRequest.find().populate('user', 'name email').sort('-createdAt');
    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending student verifications
// @route   GET /api/admin/verifications/pending
// @access  Private/Admin
exports.getPendingVerifications = async (req, res, next) => {
  try {
    const users = await User.find({ status: 'pending_approval' }).select('-password');
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject student registration
// @route   PUT /api/admin/verifications/:id
// @access  Private/Admin
exports.handleVerification = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Use approved or rejected.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { status, isVerified: status === 'approved' }, 
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Record when it was verified
    if (status === 'approved') {
      user.verifiedAt = Date.now();
      await user.save();

      // Send Welcome Email
      sendEmail({
        email: user.email,
        subject: 'Welcome to UniKart - Your Account is Approved!',
        html: welcomeTemplate(user.name)
      }).catch(err => console.error('Welcome email failed:', err));
    }


    res.json({ 
      success: true, 
      message: `User registration ${status === 'approved' ? 'approved' : 'rejected'} successfully.`,
      data: user 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to support request
// @route   PUT /api/admin/support/:id
// @access  Private/Admin
exports.respondToSupport = async (req, res, next) => {
  try {
    const { response } = req.body;
    const request = await SupportRequest.findByIdAndUpdate(
      req.params.id, 
      { adminResponse: response, status: 'replied' }, 
      { new: true }
    );
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};
