const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const User = require('../models/User');

const testRefinedQuery = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    console.log('Executing refined query...');
    const products = await Product.find({
      status: { $in: ['available', 'active'] },
      isSold: { $ne: true },
      isDeleted: { $ne: true },
      $or: [
        { stock: { $exists: false } },
        { stock: { $gt: 0 } }
      ]
    }).populate('seller', 'name email');

    console.log(`Query returned ${products.length} products!`);
    products.forEach((p, idx) => {
      console.log(`  #${idx + 1}: ${p.title} (${p.status})`);
    });

    mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
};

testRefinedQuery();
