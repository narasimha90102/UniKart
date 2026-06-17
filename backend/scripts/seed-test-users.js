const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('[DNS Override Warning] Could not set Google DNS servers:', e.message);
}

const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedUsers = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not defined in the environment variables.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Seed Regular Test User
    const testUserEmail = 'testuser@unikart.com';
    const testUserReg = 'TEST001';
    await User.deleteMany({
      $or: [
        { email: testUserEmail },
        { regNo: testUserReg }
      ]
    });
    console.log(`Cleared existing users matching ${testUserEmail} or ${testUserReg}`);
    
    let testUser = await User.create({
      name: 'Test Customer',
      email: testUserEmail,
      password: 'TestPassword123!',
      regNo: testUserReg,
      department: 'Computer Science',
      college: 'University Campus',
      phoneNumber: '1234567890',
      dob: new Date('2000-01-01'),
      gender: 'male',
      avatar: 'avatar1.png',
      address: '123 University Dorms',
      status: 'approved',
      accountStatus: 'approved',
      isApproved: true,
      signupMethod: 'email'
    });
    console.log('Test user created:', testUser.email);

    // 2. Seed Admin User
    const adminEmail = 'admin@unikart.com';
    const adminReg = 'ADMIN001';
    await User.deleteMany({
      $or: [
        { email: adminEmail },
        { regNo: adminReg }
      ]
    });
    console.log(`Cleared existing users matching ${adminEmail} or ${adminReg}`);
    
    let adminUser = await User.create({
      name: 'UniKart Admin',
      email: adminEmail,
      password: 'AdminPassword123!',
      regNo: 'ADMIN001',
      department: 'Administration',
      college: 'University Campus',
      phoneNumber: '9876543210',
      dob: new Date('1990-01-01'),
      gender: 'male',
      avatar: 'avatar2.png',
      address: 'Admin Office 101',
      status: 'approved',
      accountStatus: 'approved',
      isApproved: true,
      role: 'admin',
      signupMethod: 'email'
    });
    console.log('Admin user created:', adminUser.email);

    console.log('\n==================================================');
    console.log('          TEST ACCOUNTS SEEDED SUCCESSFULLY        ');
    console.log('==================================================');
    console.log('  Customer Email:   testuser@unikart.com');
    console.log('  Customer Pass:    TestPassword123!');
    console.log('--------------------------------------------------');
    console.log('  Admin Email:      admin@unikart.com');
    console.log('  Admin Pass:       AdminPassword123!');
    console.log('==================================================\n');

    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error seeding users:', error);
    if (mongoose.connection) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedUsers();
