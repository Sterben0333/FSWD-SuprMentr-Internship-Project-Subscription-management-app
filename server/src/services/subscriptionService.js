const Subscription = require('../models/Subscription');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const emailService = require('./emailService');
const notificationService = require('./notificationService');
const { addMonths, addYears, addDays, differenceInDays } = require('date-fns');

/*Send immediate renewal reminder if nextPaymentDate is within 3 days*/
const sendImmediateReminderIfDue = async (subscription, userId) => {
  try {
    const now = new Date();
    const nextPayment = new Date(subscription.nextPaymentDate);
    const daysUntil = differenceInDays(nextPayment, now);

    if (daysUntil >= 0 && daysUntil <= 3) {
      // Create in-app notification
      await notificationService.createNotification({
        userId,
        subscriptionId: subscription._id,
        title: `Payment due${daysUntil === 0 ? ' today' : ` in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}`,
        message: `${subscription.name} payment of ₹${subscription.cost} is ${daysUntil === 0 ? 'due today' : `coming up in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}.`,
        type: 'upcoming',
        triggerDate: nextPayment,
      });

      // Send email reminder
      const user = await User.findById(userId).select('email').lean();
      if (user?.email) {
        await emailService.sendRenewalReminder(user.email, {
          appName: subscription.name,
          plan: subscription.billingCycle,
          renewalDate: subscription.nextPaymentDate,
          cost: subscription.cost,
        });
        console.log(`📧 Immediate reminder sent to ${user.email} for ${subscription.name}`);
      }
    }
  } catch (err) {
    // Don't fail subscription creation if email fails
    console.error('📧 Immediate reminder failed:', err.message);
  }
};

/*to List subscriptions for a user with optional filters*/
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

/*to Get a single subscription*/
const getSubscription = async (id, userId) => {
  const subscription = await Subscription.findOne({ _id: id, userId })
    .populate('categoryId', 'name color icon');
  if (!subscription) {
    throw ApiError.notFound('Subscription not found');
  }
  return subscription;
};

/* Create a new subscription*/
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

  // Send immediate email reminder if renewal is within 3 days
  await sendImmediateReminderIfDue(subscription, userId);

  return subscription.populate('categoryId', 'name color icon');
};

/*Update a subscription*/
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

  // Check if nextPaymentDate is being changed
  const paymentDateChanged = data.nextPaymentDate &&
    new Date(data.nextPaymentDate).getTime() !== new Date(subscription.nextPaymentDate).getTime();

  // Update lastInteractedAt
  data.lastInteractedAt = new Date();

  Object.assign(subscription, data);
  await subscription.save();

  // Send immediate email reminder if nextPaymentDate was changed to within 3 days
  if (paymentDateChanged) {
    await sendImmediateReminderIfDue(subscription, userId);
  }

  return subscription.populate('categoryId', 'name color icon');
};

/*Delete a subscription*/
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
