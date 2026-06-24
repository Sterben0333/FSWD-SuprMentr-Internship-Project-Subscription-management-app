const Subscription = require('../models/Subscription');

/*Get dashboard summary for a user*/
const getDashboardSummary = async (userId) => {
  const subscriptions = await Subscription.find({ userId })
    .populate('categoryId', 'name color icon')
    .lean();

  const now = new Date();
  const activeStatuses = ['active', 'trial'];

  // for Active subscriptions
  const active = subscriptions.filter((s) => activeStatuses.includes(s.status));

  // for Monthly cost (normalize all cycles to monthly)
  const totalMonthly = active.reduce((sum, s) => sum + normalizeToMonthly(s), 0);

  // the Yearly projected
  const totalYearly = totalMonthly * 12;

  // subs Upcoming in next 7 days
  const sevenDaysOut = new Date(now);
  sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);
  const upcoming = subscriptions
    .filter((s) =>
      activeStatuses.includes(s.status) &&
      s.nextPaymentDate &&
      new Date(s.nextPaymentDate) >= now &&
      new Date(s.nextPaymentDate) <= sevenDaysOut
    )
    .sort((a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate));

  // Overdue (past nextPaymentDate but still active)
  const overdue = subscriptions.filter(
    (s) => activeStatuses.includes(s.status) &&
      s.nextPaymentDate &&
      new Date(s.nextPaymentDate) < now
  );

  // Status breakdown
  const statusCounts = {
    active: subscriptions.filter((s) => s.status === 'active').length,
    trial: subscriptions.filter((s) => s.status === 'trial').length,
    expiring: subscriptions.filter((s) => s.status === 'expiring').length,
    paused: subscriptions.filter((s) => s.status === 'paused').length,
    cancelled: subscriptions.filter((s) => s.status === 'cancelled').length,
  };

  // Cost by category
  const categorySpend = {};
  active.forEach((s) => {
    const catName = s.categoryId?.name || 'Other';
    const catColor = s.categoryId?.color || '#95A5A6';
    const catIcon = s.categoryId?.icon || '📦';
    if (!categorySpend[catName]) {
      categorySpend[catName] = { name: catName, color: catColor, icon: catIcon, total: 0, count: 0 };
    }
    categorySpend[catName].total += normalizeToMonthly(s);
    categorySpend[catName].count += 1;
  });

  // showing Most expensive subscriptions
  const mostExpensive = [...active]
    .sort((a, b) => normalizeToMonthly(b) - normalizeToMonthly(a))
    .slice(0, 5)
    .map((s) => ({
      _id: s._id,
      name: s.name,
      cost: s.cost,
      monthlyCost: normalizeToMonthly(s),
      billingCycle: s.billingCycle,
      category: s.categoryId,
    }));

  return {
    totalSubscriptions: subscriptions.length,
    activeCount: active.length,
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    totalYearly: Math.round(totalYearly * 100) / 100,
    upcoming,
    overdue,
    statusCounts,
    categorySpend: Object.values(categorySpend).sort((a, b) => b.total - a.total),
    mostExpensive,
  };
};

// Normalize any billing cycle to monthly cost
function normalizeToMonthly(sub) {
  switch (sub.billingCycle) {
    case 'monthly':
      return sub.cost;
    case 'yearly':
      return sub.cost / 12;
    case 'custom':
      return (sub.cost / (sub.customCycleDays || 30)) * 30;
    default:
      return sub.cost;
  }
}

module.exports = { getDashboardSummary };
