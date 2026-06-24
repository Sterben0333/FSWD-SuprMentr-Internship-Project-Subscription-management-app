const User = require('../models/User');
const Subscription = require('../models/Subscription');

/**
 * Get admin dashboard stats — total registered users, active users (with subscriptions),
 * recent signups, and a user list with their subscription counts.
 */
const getStats = async (req, res, next) => {
  try {
    // Total number of registered users (excluding admins)
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });

    // Users who signed up in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersLast30Days = await User.countDocuments({
      role: { $ne: 'admin' },
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Users who signed up in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersLast7Days = await User.countDocuments({
      role: { $ne: 'admin' },
      createdAt: { $gte: sevenDaysAgo },
    });

    // Total subscriptions across all users
    const totalSubscriptions = await Subscription.countDocuments();

    // Active subscriptions
    const activeSubscriptions = await Subscription.countDocuments({
      status: { $in: ['active', 'trial'] },
    });

    // Get user list with subscription counts (latest 50 users)
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Get subscription counts per user
    const userIds = users.map((u) => u._id);
    const subCounts = await Subscription.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);

    const subCountMap = {};
    subCounts.forEach((s) => {
      subCountMap[s._id.toString()] = s.count;
    });

    const userList = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      joinedAt: u.createdAt,
      subscriptionCount: subCountMap[u._id.toString()] || 0,
    }));

    res.json({
      success: true,
      data: {
        totalUsers,
        newUsersLast30Days,
        newUsersLast7Days,
        totalSubscriptions,
        activeSubscriptions,
        users: userList,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };
