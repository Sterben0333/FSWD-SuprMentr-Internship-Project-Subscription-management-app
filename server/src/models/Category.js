const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: 50,
    },
    color: {
      type: String,
      required: true,
      default: '#95A5A6',
    },
    icon: {
      type: String,
      default: '📦',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = global preset category
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: unique category name per user (or globally if userId is null)
categorySchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
