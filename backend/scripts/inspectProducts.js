const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');

const inspect = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is missing from .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const products = await Product.find({});
    console.log(`Found ${products.length} total products in database:`);
    
    products.forEach((prod, index) => {
      console.log(`\n[Product #${index + 1}]`);
      console.log(`ID: ${prod._id}`);
      console.log(`Title: ${prod.title}`);
      console.log(`Status: ${prod.status}`);
      console.log(`isSold: ${prod.isSold} (type: ${typeof prod.isSold})`);
      console.log(`isDeleted: ${prod.isDeleted} (type: ${typeof prod.isDeleted})`);
      console.log(`stock: ${prod.stock} (type: ${typeof prod.stock})`);
      console.log(`availability: ${prod.availability}`);
    });

    mongoose.disconnect();
  } catch (err) {
    console.error('Error during inspection:', err);
  }
};

inspect();
