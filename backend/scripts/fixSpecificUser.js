const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const fixSpecificUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'narasimhareddyp2091.sse@saveetha.com';
    const result = await User.updateOne(
      { email: email },
      { $set: { isVerified: true, status: 'approved' } }
    );

    console.log(`Updated user ${email}: ${result.modifiedCount} modified.`);
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixSpecificUser();
