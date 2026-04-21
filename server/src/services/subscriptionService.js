const Subscription = require('../models/Subscription');
const ApiError = require('../utils/ApiError');
const { addMonths, addYears, addDays } = require('date-fns');

/**
 * List subscriptions for a user with optional filters
 */
const listSubscriptions = async (userId, filters = {}) => {
  const query = { userId };

  if (filters.status && filters.status !== 'all') {
    query.status = filters.status;
  }
  if (filters.categoryId && filters.categoryId !== 'all') {
    query.categoryId = filters.categoryId;
  }
  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }

  const subscriptions = await Subscription.find(query)
    .populate('categoryId', 'name color icon')
    .sort({ nextPaymentDate: 1 })
    .lean();

  return subscriptions;
};

/**
 * Get a single subscription
 */
const getSubscription = async (id, userId) => {
  const subscription = await Subscription.findOne({ _id: id, userId })
    .populate('categoryId', 'name color icon');
  if (!subscription) {
    throw ApiError.notFound('Subscription not found');
  }
  return subscription;
};

/**
 * Create a new subscription
 */
const createSubscription = async (userId, data) => {
  // Auto-calculate nextPaymentDate if not provided
  const startDate = data.startDate ? new Date(data.startDate) : new Date();
  let nextPaymentDate = data.nextPaymentDate
    ? new Date(data.nextPaymentDate)
    : calculateNextDate(startDate, data.billingCycle, data.customCycleDays);

  const subscription = await Subscription.create({
    ...data,
    userId,
    startDate,
    nextPaymentDate,
    lastInteractedAt: new Date(),
  });

  return subscription.populate('categoryId', 'name color icon');
};

/**
 * Update a subscription
 */
const updateSubscription = async (id, userId, data) => {
  const subscription = await Subscription.findOne({ _id: id, userId });
  if (!subscription) {
    throw ApiError.notFound('Subscription not found');
  }

  // Recalculate nextPaymentDate if billing cycle changes
  if (data.billingCycle && data.billingCycle !== subscription.billingCycle) {
    const baseDate = data.startDate ? new Date(data.startDate) : subscription.startDate;
    data.nextPaymentDate = calculateNextDate(baseDate, data.billingCycle, data.customCycleDays);
  }

  // Update lastInteractedAt
  data.lastInteractedAt = new Date();

  Object.assign(subscription, data);
  await subscription.save();

  return subscription.populate('categoryId', 'name color icon');
};

/**
 * Delete a subscription
 */
const deleteSubscription = async (id, userId) => {
  const subscription = await Subscription.findOneAndDelete({ _id: id, userId });
  if (!subscription) {
    throw ApiError.notFound('Subscription not found');
  }
  return subscription;
};

// ——— Helper ———
function calculateNextDate(fromDate, cycle, customDays) {
  const date = new Date(fromDate);
  switch (cycle) {
    case 'monthly':
      return addMonths(date, 1);
    case 'yearly':
      return addYears(date, 1);
    case 'custom':
      return addDays(date, customDays || 30);
    default:
      return addMonths(date, 1);
  }
}

module.exports = {
  listSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};
