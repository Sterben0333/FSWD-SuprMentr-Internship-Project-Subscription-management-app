const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Subscription name is required'],
      trim: true,
      maxlength: 100,
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly', 'custom'],
      required: true,
      default: 'monthly',
    },
    customCycleDays: {
      type: Number,
      default: null,
      min: 1,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    nextPaymentDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'trial', 'expiring', 'paused', 'cancelled'],
      default: 'active',
    },
    trialEndDate: {
      type: Date,
      default: null,
    },
    lastInteractedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: null,
      maxlength: 500,
    },
    logoUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ userId: 1, nextPaymentDate: 1 });
subscriptionSchema.index({ status: 1, nextPaymentDate: 1 }); // For billing job

module.exports = mongoose.model('Subscription', subscriptionSchema);
