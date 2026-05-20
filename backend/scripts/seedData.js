const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('[DNS Override Warning] Could not set Google DNS servers:', e.message);
}

const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const mockProducts = [
  {
    title: 'Casio fx-991EX ClassWiz Scientific Calculator',
    description: 'Perfect condition scientific calculator, highly recommended for engineering students. Features high-resolution LCD display and spreadsheet functionality. Barely used for one semester.',
    price: 950,
    originalPrice: 1600,
    category: 'Electronics',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1611079830811-b65d1a36838e?auto=format&fit=crop&w=600&q=80'],
    location: 'Saveetha Engineering College',
    featured: true
  },
  {
    title: 'Standard Premium White Lab Coat (Medium)',
    description: 'Freshly washed and ironed white lab coat. Appropriate for chemistry, physics, and biology lab sessions. Made of durable, high-quality cotton blend material.',
    price: 250,
    originalPrice: 500,
    category: 'Lab Gear',
    condition: 'Used - Good',
    images: ['https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=600&q=80'],
    location: 'Saveetha Engineering College',
    featured: false
  },
  {
    title: 'Advanced Engineering Mathematics - 10th Edition',
    description: 'Written by Erwin Kreyszig. A must-have textbook for foundation math courses. Clean pages, no highlights or pen marks. CD-ROM is included and intact.',
    price: 600,
    originalPrice: 1200,
    category: 'Textbooks',
    condition: 'Used - Good',
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80'],
    location: 'Saveetha Engineering College',
    featured: true
  },
  {
    title: 'Dorm Room Study Lamp - Rechargeable LED RGB',
    description: 'Flexible neck LED study lamp with multiple color temperatures (Warm, Natural, Cool White) and a vibrant RGB base. Charge lasts up to 8 hours. Perfect for night study.',
    price: 350,
    originalPrice: 800,
    category: 'Dorm Items',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80'],
    location: 'Saveetha Engineering College',
    featured: false
  },
  {
    title: 'Sporty Campus Bicycle - 6-Speed Gears',
    description: 'Excellent campus bicycle, ideal for commuting between blocks. Features 6-speed Shimano gears, comfortable saddle, rear carrier, and front suspension. Smooth ride.',
    price: 3200,
    originalPrice: 6500,
    category: 'Bicycles',
    condition: 'Used - Good',
    images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80'],
    location: 'Saveetha Engineering College',
    featured: true
  }
];

const seedData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Error: MONGO_URI is not defined.');
      process.exit(1);
    }

    console.log('Connecting to local MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database successfully!');

    // 1. Find or create a student seller user
    console.log('Setting up a mock student seller...');
    let seller = await User.findOne({ email: 'student1@saveetha.com' });
    if (!seller) {
      seller = await User.create({
        name: 'Rahul Kumar',
        email: 'student1@saveetha.com',
        password: 'Password123!',
        regNo: '2024SEC0101',
        role: 'user',
        status: 'approved',
        isVerified: true
      });
      console.log('Created mock student seller: student1@saveetha.com');
    } else {
      console.log('Mock student seller already exists.');
    }

    // 2. Clear old products
    console.log('Clearing old product database...');
    await Product.deleteMany({});
    console.log('Old products cleared.');

    // 3. Insert mock products
    console.log('Inserting fresh campus products...');
    const productsToSave = mockProducts.map(p => ({
      ...p,
      seller: seller._id
    }));

    await Product.insertMany(productsToSave);
    console.log('Successfully seeded 5 premium campus products!');

    console.log('\n==================================================');
    console.log('           DATABASE SEEDING COMPLETED             ');
    console.log('==================================================');
    console.log('  Admin Credentials:');
    console.log('    Email:    narasimhareddy90102@gmail.com');
    console.log('    Password: Admin123!');
    console.log('\n  Mock Seller Credentials:');
    console.log('    Email:    student1@saveetha.com');
    console.log('    Password: Password123!');
    console.log('==================================================\n');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    if (mongoose.connection) {
      mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedData();
