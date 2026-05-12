const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const fixStatuses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await User.updateMany(
      { status: 'active' },
      { $set: { status: 'approved' } }
    );

    console.log(`Updated ${result.modifiedCount} users from 'active' to 'approved'.`);
    
    // Also ensure the admin is approved
    const adminResult = await User.updateOne(
      { email: 'narasimhareddy90102@gmail.com' },
      { $set: { status: 'approved', role: 'admin' } }
    );
    console.log(`Admin user status updated: ${adminResult.modifiedCount}`);

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixStatuses();
