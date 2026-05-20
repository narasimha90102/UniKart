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

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Error: MONGO_URI is not defined in the environment variables.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    // Parse command line arguments if provided
    // Usage: node createAdmin.js [email] [password] [name] [regNo]
    const args = process.argv.slice(2);
    const email = (args[0] || 'admin@unikart.com').toLowerCase().trim();
    const password = args[1] || 'AdminPassword123!';
    const name = args[2] || 'UniKart Admin';
    const regNo = (args[3] || 'ADMIN001').toUpperCase().trim();

    if (password.length < 8) {
      console.error('Error: Password must be at least 8 characters long.');
      mongoose.connection.close();
      process.exit(1);
    }

    // Check if the user already exists by email
    let user = await User.findOne({ email });

    if (user) {
      console.log(`User with email "${email}" already exists. Updating account to Admin status and resetting password...`);
      user.name = name;
      user.regNo = regNo;
      user.password = password; // Pre-save hook will hash this
      user.role = 'admin';
      user.status = 'approved';
      user.isVerified = true;
      await user.save();
      console.log('Account updated successfully!');
    } else {
      // Check if regNo already exists
      const regNoExists = await User.findOne({ regNo });
      if (regNoExists) {
        console.error(`Error: Register Number "${regNo}" is already taken by another user (${regNoExists.email}).`);
        mongoose.connection.close();
        process.exit(1);
      }

      console.log(`Creating a brand new admin user: ${email}...`);
      user = await User.create({
        name,
        email,
        password,
        regNo,
        role: 'admin',
        status: 'approved',
        isVerified: true
      });
      console.log('Admin account created successfully!');
    }

    console.log('\n==================================================');
    console.log('             ADMIN CREDENTIALS GENERATED          ');
    console.log('==================================================');
    console.log(`  Role:     ${user.role}`);
    console.log(`  Name:     ${user.name}`);
    console.log(`  Email:    ${user.email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Reg No:   ${user.regNo}`);
    console.log('==================================================\n');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin:', error);
    if (mongoose.connection) {
      mongoose.connection.close();
    }
    process.exit(1);
  }
};

createAdmin();
