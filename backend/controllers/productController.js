const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('name');
    res.json({ success: true, count: categories.length, data: categories.map(c => c.name) });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/products/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/products/categories/:name
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.findOneAndDelete({ name: req.params.name });
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    let query;
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Handle search text & status filter
    // If no status is specified, default to fetching both 'active' and 'available' products
    const statusFilter = req.query.status 
      ? (req.query.status === 'all' ? { $exists: true } : req.query.status) 
      : { $in: ['active', 'available'] };
    
    if (req.query.search) {
      query = Product.find({ 
        $text: { $search: req.query.search }, 
        ...reqQuery, 
        status: statusFilter 
      });
    } else {
      query = Product.find({ 
        ...reqQuery, 
        status: statusFilter 
      });
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;
    
    query = query.skip(startIndex).limit(limit).populate('seller', 'name college ratings');

    const products = await query;

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name college ratings');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res, next) => {
  try {
    req.body.seller = req.user.id;
    // Set default location from user's college if not provided
    if (!req.body.location) {
      req.body.location = req.user.college || 'Saveetha Engineering College';
    }
    
    const { title, description, price, category, condition, images } = req.body;
    
    // Explicit Validation of Required Fields
    if (!title || !description || !price || !category || !condition || !images || images.length === 0) {
      console.warn('[ProductController] Product creation validation failed: missing fields.');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Title, Description, Price, Category, Condition, and at least one Image.'
      });
    }

    // Default status to 'active' on creation to guarantee perfect visibility
    if (!req.body.status) {
      req.body.status = 'active';
    }

    const product = await Product.create(req.body);
    console.log('[ProductController] Successfully saved new product in MongoDB:', product);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('[ProductController] Failed to save product:', error);
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Make sure user is product owner or admin, 
    // BUT allow anyone to mark it as sold (simulating a purchase)
    const isPurchase = Object.keys(req.body).length === 1 && req.body.status === 'sold';
    
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin' && !isPurchase) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this product' });
    }

    // Auto-update schema properties when status shifts
    if (req.body.status === 'sold') {
      req.body.isSold = true;
      req.body.stock = 0;
      req.body.availability = 'unavailable';
    } else if (req.body.status === 'available' || req.body.status === 'active') {
      req.body.isSold = false;
      req.body.stock = req.body.stock !== undefined ? req.body.stock : 1;
      req.body.availability = 'available';
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Make sure user is product owner or admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this product' });
    }

    await product.deleteOne();

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
