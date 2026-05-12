const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyAllUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await User.updateMany(
      { isVerified: false },
      { $set: { isVerified: true } }
    );

    console.log(`Updated ${result.modifiedCount} users to isVerified: true.`);
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

verifyAllUsers();
