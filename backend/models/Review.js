const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.ObjectId,
      ref: 'Order',
      required: true,
      unique: true
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true
    },
    buyer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    seller: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5
    },
    reviewText: {
      type: String,
      required: [true, 'Please provide review content']
    },
    images: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
