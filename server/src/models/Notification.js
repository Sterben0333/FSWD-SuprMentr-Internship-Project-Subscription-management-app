const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ['upcoming', 'overdue', 'budget_alert', 'trial_ending', 'unused_sub'],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    triggerDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast notification queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, subscriptionId: 1, type: 1, triggerDate: 1 }); // Duplicate prevention

module.exports = mongoose.model('Notification', notificationSchema);
