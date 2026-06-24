/**
 * Seed script to set admin role for the designated admin user.
 * 
 * Run with: node server/src/seeds/seedAdmin.js
 * 
 * This will:
 * 1. Find the admin user by email
 * 2. If found, set their role to 'admin'
 * 3. If not found, log a message to register first
 */
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const User = require('../models/User');

const ADMIN_EMAIL = 'vyomdhip1132003@gmail.com';

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: ADMIN_EMAIL });
    if (!user) {
      console.log(`❌ User with email ${ADMIN_EMAIL} not found.`);
      console.log('   Please register with this email first, then run this script again.');
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`✅ ${ADMIN_EMAIL} is already an admin.`);
    } else {
      user.role = 'admin';
      await user.save();
      console.log(`✅ ${ADMIN_EMAIL} has been promoted to admin.`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
