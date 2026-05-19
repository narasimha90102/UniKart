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
    console.log('[AdminController] createUser called');
    console.log('[AdminController] Request body received:', req.body);

    const { name, email, password, role, college, regNo, status, department } = req.body;

    // 1. Validation for required fields
    if (!name || !email || !password || !regNo) {
      console.warn('[AdminController] Validation failed: Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: Name, Email, Password, and Register Number.' 
      });
    }

    // 2. Password length validation (since schema expects minlength 8)
    if (password.length < 8) {
      console.warn('[AdminController] Validation failed: Password too short');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    // 3. Email format validation (matching the schema regex)
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      console.warn('[AdminController] Validation failed: Invalid email format');
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid university email address.'
      });
    }

    // 4. Check duplicate email
    console.log('[AdminController] Checking for duplicate email...');
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      console.warn(`[AdminController] Duplicate check failed: Email ${email} already exists.`);
      return res.status(400).json({ success: false, message: 'A user with this email address already exists.' });
    }

    // 5. Check duplicate regNo
    console.log('[AdminController] Checking for duplicate Register Number...');
    const regNoExists = await User.findOne({ regNo });
    if (regNoExists) {
      console.warn(`[AdminController] Duplicate check failed: Register Number ${regNo} already exists.`);
      return res.status(400).json({ success: false, message: 'A user with this Register Number already exists.' });
    }

    // 6. Create User in MongoDB
    console.log('[AdminController] Creating user document in MongoDB...');
    const user = await User.create({
      name,
      email,
      password,
      regNo,
      role: role || 'user',
      college: college || 'University Campus',
      department: department || '',
      status: status || 'approved',
      isVerified: true
    });

    // Remove password from output
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('[AdminController] User created successfully in DB:', userResponse);
    res.status(201).json({ success: true, data: userResponse });
  } catch (error) {
    console.error('[AdminController] Error in createUser:', error);
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    console.log(`[AdminController] updateUser called for ID: ${req.params.id}`);
    console.log('[AdminController] Request body received:', req.body);

    const { name, email, role, status, regNo, college, department } = req.body;
    
    // Check if email is already taken by another user
    if (email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (emailExists) {
        console.warn(`[AdminController] Update failed: Email ${email} is already registered to another account.`);
        return res.status(400).json({ success: false, message: 'Email is already taken by another user' });
      }
    }

    // Check if regNo is already taken by another user
    if (regNo) {
      const regNoExists = await User.findOne({ regNo, _id: { $ne: req.params.id } });
      if (regNoExists) {
        console.warn(`[AdminController] Update failed: Register Number ${regNo} is already registered to another account.`);
        return res.status(400).json({ success: false, message: 'Register Number is already taken by another user' });
      }
    }

    const updateFields = { name, email, role, status };
    if (regNo !== undefined) updateFields.regNo = regNo;
    if (college !== undefined) updateFields.college = college;
    if (department !== undefined) updateFields.department = department;

    console.log('[AdminController] Executing Mongoose update with:', updateFields);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      console.warn(`[AdminController] User with ID ${req.params.id} not found.`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('[AdminController] User updated successfully:', user);
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('[AdminController] Error in updateUser:', error);
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

// @desc    Get all active/available products for oversight
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getAllProducts = async (req, res, next) => {
  try {
    console.log('[AdminController] Fetching available marketplace listings for oversight...');
    const products = await Product.find({
      status: { $in: ['available', 'active'] },
      isSold: { $ne: true },
      isDeleted: { $ne: true },
      $or: [
        { stock: { $exists: false } },
        { stock: { $gt: 0 } }
      ]
    }).populate('seller', 'name email');

    console.log(`[AdminController] Query matched and retrieved ${products.length} active products.`);
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('[AdminController] Error fetching oversight products:', error);
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
