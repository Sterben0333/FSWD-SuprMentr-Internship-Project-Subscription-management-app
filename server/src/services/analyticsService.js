const Subscription = require('../models/Subscription');

/**
 * Get analytics data for charts
 */
const getAnalytics = async (userId) => {
  const subscriptions = await Subscription.find({ userId })
    .populate('categoryId', 'name color icon')
    .lean();

  const activeStatuses = ['active', 'trial'];
  const active = subscriptions.filter((s) => activeStatuses.includes(s.status));

  // Monthly trend (last 12 months simulation based on current subscriptions)
  const monthlyTrend = generateMonthlyTrend(active);

  // Category distribution (pie chart)
  const categoryDistribution = {};
  active.forEach((s) => {
    const cat = s.categoryId?.name || 'Other';
    const color = s.categoryId?.color || '#95A5A6';
    if (!categoryDistribution[cat]) {
      categoryDistribution[cat] = { name: cat, value: 0, color };
    }
    categoryDistribution[cat].value += normalizeToMonthly(s);
  });

  // Billing cycle distribution
  const cycleDistribution = { monthly: 0, yearly: 0, custom: 0 };
  active.forEach((s) => {
    cycleDistribution[s.billingCycle] = (cycleDistribution[s.billingCycle] || 0) + 1;
  });

  // Cost range distribution
  const costRanges = [
    { range: '₹0–100', min: 0, max: 100, count: 0 },
    { range: '₹100–500', min: 100, max: 500, count: 0 },
    { range: '₹500–1K', min: 500, max: 1000, count: 0 },
    { range: '₹1K–5K', min: 1000, max: 5000, count: 0 },
    { range: '₹5K+', min: 5000, max: Infinity, count: 0 },
  ];
  active.forEach((s) => {
    const monthly = normalizeToMonthly(s);
    const range = costRanges.find((r) => monthly >= r.min && monthly < r.max);
    if (range) range.count += 1;
  });

  return {
    monthlyTrend,
    categoryDistribution: Object.values(categoryDistribution)
      .map((c) => ({ ...c, value: Math.round(c.value) }))
      .sort((a, b) => b.value - a.value),
    cycleDistribution: Object.entries(cycleDistribution).map(([name, value]) => ({ name, value })),
    costRanges: costRanges.map(({ range, count }) => ({ range, count })),
    totalActive: active.length,
    totalMonthly: Math.round(active.reduce((sum, s) => sum + normalizeToMonthly(s), 0)),
  };
};

function normalizeToMonthly(sub) {
  switch (sub.billingCycle) {
    case 'monthly': return sub.cost;
    case 'yearly': return sub.cost / 12;
    case 'custom': return (sub.cost / (sub.customCycleDays || 30)) * 30;
    default: return sub.cost;
  }
}

function generateMonthlyTrend(subs) {
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    // Approximate: count subs active by that month based on startDate
    const activeThen = subs.filter((s) => new Date(s.startDate) <= d);
    const total = activeThen.reduce((sum, s) => sum + normalizeToMonthly(s), 0);
    months.push({ month: monthStr, cost: Math.round(total) });
  }
  return months;
}

module.exports = { getAnalytics };
