const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a product title'],
      trim: true,
      maxlength: [100, 'Title can not be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description can not be more than 1000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Please add a price']
    },
    originalPrice: {
      type: Number
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
    },
    condition: {
      type: String,
      required: [true, 'Please specify the condition'],
      enum: ['New', 'Like New', 'Used - Good', 'Used - Fair']
    },
    images: {
      type: [String], // Array of image URLs
      required: true
    },
    seller: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    location: {
      type: String,
      default: 'Saveetha Engineering College'
    },
    status: {
      type: String,
      enum: ['available', 'active', 'sold', 'moderated', 'deleted', 'archived'],
      default: 'available'
    },
    isSold: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    stock: {
      type: Number,
      default: 1
    },
    availability: {
      type: String,
      default: 'available'
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Add index for searching
productSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
