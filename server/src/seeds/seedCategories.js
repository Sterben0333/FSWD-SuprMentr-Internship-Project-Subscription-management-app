const mongoose = require('mongoose');
const path = require('path');

// Load env from project root
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const Category = require('../models/Category');

const presetCategories = [
  { name: 'Gaming', color: '#F39C12', icon: '🎮' },
  { name: 'Entertainment', color: '#E74C3C', icon: '🎬' },
  { name: 'Shopping', color: '#00A8E1', icon: '🛒' },
  { name: 'Music', color: '#1DB954', icon: '🎵' },
  { name: 'Other', color: '#95A5A6', icon: '📦' },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Remove existing global categories (userId = null)
    await Category.deleteMany({ userId: null });
    console.log('🗑️  Cleared existing preset categories');

    // Insert preset categories
    const created = await Category.insertMany(
      presetCategories.map((cat) => ({ ...cat, userId: null }))
    );
    console.log(`✅ Seeded ${created.length} preset categories:`);
    created.forEach((cat) => console.log(`   ${cat.icon} ${cat.name} (${cat.color})`));

    await mongoose.disconnect();
    console.log('✅ Done! Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedCategories();
