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

const resetAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Error: MONGO_URI is not defined in backend/.env file.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully!');

    // 1. Fetch and list all users in the system for visibility
    console.log('\n--- FETCHING EXISTING USERS ---');
    const users = await User.find().select('name email role status isVerified regNo');
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log(`Found ${users.length} user(s):`);
      users.forEach((u, i) => {
        console.log(`  [${i + 1}] Name: "${u.name}" | Email: "${u.email}" | Role: "${u.role}" | Status: "${u.status}" | Verified: ${u.isVerified} | RegNo: "${u.regNo}"`);
      });
    }
    console.log('-------------------------------\n');

    // 2. Identify the target email to reset or create
    const args = process.argv.slice(2);
    const targetEmail = (args[0] || 'narasimhareddy90102@gmail.com').toLowerCase().trim();
    const newPassword = args[1] || 'Admin123!';
    const regNo = (args[2] || 'ADMIN001').toUpperCase().trim();
    const name = args[3] || 'UniKart Admin';

    console.log(`Target admin account: "${targetEmail}"`);
    console.log(`Target password:      "${newPassword}"`);
    console.log('-------------------------------\n');

    let user = await User.findOne({ email: targetEmail });

    if (user) {
      console.log(`User "${targetEmail}" exists. Updating status to approved, role to admin, and resetting password...`);
      user.role = 'admin';
      user.status = 'approved';
      user.isVerified = true;
      user.password = newPassword; // Mongoose schema pre('save') hashes this automatically
      
      // Fix regNo if it is missing, invalid, or needs custom update
      if (!user.regNo || user.regNo === 'undefined' || (regNo !== 'ADMIN001' && user.regNo !== regNo)) {
        const regNoExists = await User.findOne({ regNo, _id: { $ne: user._id } });
        if (regNoExists) {
          user.regNo = `ADMIN_${Date.now().toString().slice(-4)}`;
        } else {
          user.regNo = regNo;
        }
      }
      
      await user.save();
      console.log('Account successfully updated and password reset!');
    } else {
      console.log(`User "${targetEmail}" does not exist. Checking for Register Number duplicates...`);
      
      const regNoExists = await User.findOne({ regNo });
      if (regNoExists) {
        console.log(`Register number "${regNo}" is taken by "${regNoExists.email}". Using unique Register Number...`);
      }

      const finalRegNo = regNoExists ? `ADMIN_${Date.now().toString().slice(-4)}` : regNo;

      console.log(`Creating a brand new Admin account with Email: "${targetEmail}" and RegNo: "${finalRegNo}"...`);
      user = await User.create({
        name,
        email: targetEmail,
        password: newPassword,
        regNo: finalRegNo,
        role: 'admin',
        status: 'approved',
        isVerified: true
      });
      console.log('Admin account created successfully!');
    }

    console.log('\n==================================================');
    console.log('            SUCCESSFULLY CONFIGURED ADMIN         ');
    console.log('==================================================');
    console.log(`  Name:     ${user.name}`);
    console.log(`  Email:    ${user.email}`);
    console.log(`  Password: ${newPassword}`);
    console.log(`  Role:     ${user.role}`);
    console.log(`  Status:   ${user.status}`);
    console.log(`  Verified: ${user.isVerified}`);
    console.log(`  Reg No:   ${user.regNo}`);
    console.log('==================================================');
    console.log('\nYou can now open your browser and log in with');
    console.log('these credentials on the UniKart login page.\n');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error running resetAdmin script:', error);
    if (mongoose.connection) {
      mongoose.connection.close();
    }
    process.exit(1);
  }
};

resetAdmin();
