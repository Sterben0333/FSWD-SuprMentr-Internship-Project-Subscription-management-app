const cron = require('node-cron');
const { addDays, isBefore, isAfter, differenceInDays } = require('date-fns');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const emailService = require('../services/emailService');

/**
 * Run all scheduled jobs
 * Called once on server start
 */
const initCronJobs = () => {
  // Run daily at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running daily lifecycle & notification jobs...');
    try {
      await runUpcomingPaymentAlerts();
      await runTrialEndingAlerts();
      await runUnusedSubscriptionAlerts();
      await runLifecycleTransitions();
      console.log('✅ Daily jobs completed');
    } catch (error) {
      console.error('❌ Cron job error:', error.message);
    }
  });

  console.log('🕐 Cron jobs scheduled (daily at 8:00 AM)');
};

/**
 * Alert: Upcoming payments in next 3 days
 */
const runUpcomingPaymentAlerts = async () => {
  const now = new Date();
  const threeDaysOut = addDays(now, 3);

  const subs = await Subscription.find({
    status: { $in: ['active', 'trial'] },
    nextPaymentDate: { $gte: now, $lte: threeDaysOut },
  }).populate('userId', '_id email');

  for (const sub of subs) {
    const daysUntil = differenceInDays(new Date(sub.nextPaymentDate), now);
    await notificationService.createNotification({
      userId: sub.userId._id,
      subscriptionId: sub._id,
      title: `Payment due${daysUntil === 0 ? ' today' : ` in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}`,
      message: `${sub.name} payment of ₹${sub.cost} is ${daysUntil === 0 ? 'due today' : `coming up in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}.`,
      type: 'upcoming',
      triggerDate: new Date(sub.nextPaymentDate),
    });

    // Send email reminder
    if (sub.userId.email) {
      await emailService.sendRenewalReminder(sub.userId.email, {
        appName: sub.name,
        plan: sub.billingCycle,
        renewalDate: sub.nextPaymentDate,
        cost: sub.cost,
      });
    }
  }
};

/**
 * Alert: Trial ending in next 3 days
 */
const runTrialEndingAlerts = async () => {
  const now = new Date();
  const threeDaysOut = addDays(now, 3);

  const subs = await Subscription.find({
    status: 'trial',
    trialEndDate: { $gte: now, $lte: threeDaysOut },
  }).populate('userId', '_id');

  for (const sub of subs) {
    const daysUntil = differenceInDays(new Date(sub.trialEndDate), now);
    await notificationService.createNotification({
      userId: sub.userId._id,
      subscriptionId: sub._id,
      title: `Trial ending${daysUntil === 0 ? ' today' : ` in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}`,
      message: `${sub.name} trial ends soon. Decide whether to keep or cancel.`,
      type: 'trial_ending',
      triggerDate: new Date(sub.trialEndDate),
    });
  }
};

/**
 * Alert: Unused subscriptions (no interaction in 30+ days)
 */
const runUnusedSubscriptionAlerts = async () => {
  const thirtyDaysAgo = addDays(new Date(), -30);

  const subs = await Subscription.find({
    status: 'active',
    lastInteractedAt: { $lt: thirtyDaysAgo },
  }).populate('userId', '_id');

  for (const sub of subs) {
    const daysSince = differenceInDays(new Date(), new Date(sub.lastInteractedAt));
    await notificationService.createNotification({
      userId: sub.userId._id,
      subscriptionId: sub._id,
      title: 'Unused subscription detected',
      message: `${sub.name} hasn't been interacted with in ${daysSince} days. Consider cancelling?`,
      type: 'unused_sub',
      triggerDate: new Date(),
    });
  }
};

/**
 * Lifecycle: Auto-transition subscription statuses
 */
const runLifecycleTransitions = async () => {
  const now = new Date();

  // Trial → Expiring (when trial ends)
  await Subscription.updateMany(
    { status: 'trial', trialEndDate: { $lt: now } },
    { status: 'expiring' }
  );

  // Expiring → Active (auto-advance nextPaymentDate for active subs past due)
  const overdue = await Subscription.find({
    status: { $in: ['active'] },
    nextPaymentDate: { $lt: now },
  });

  for (const sub of overdue) {
    // Advance to next cycle
    let next = new Date(sub.nextPaymentDate);
    while (isBefore(next, now)) {
      if (sub.billingCycle === 'monthly') next = addDays(next, 30);
      else if (sub.billingCycle === 'yearly') next = addDays(next, 365);
      else next = addDays(next, sub.customCycleDays || 30);
    }
    sub.nextPaymentDate = next;
    await sub.save();
  }
};

module.exports = { initCronJobs };
