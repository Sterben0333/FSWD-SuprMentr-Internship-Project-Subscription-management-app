import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow, isWithinInterval, addDays } from 'date-fns';
import useAuthStore from '../../store/authStore';
import { dashboardAPI } from './dashboardAPI';
import { subscriptionAPI, categoryAPI } from '../subscriptions/subscriptionAPI';
import { DEFAULT_APPS, getCycleLabel } from '../../data/defaultApps';
import DefaultAppCard from './DefaultAppCard';
import SubscriptionForm from '../subscriptions/SubscriptionForm';
import './DashboardPage.css';

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [userSubs, setUserSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const currency = user?.currency || 'INR';

  const fmt = (amount) =>
    new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);

  const loadData = async () => {
    try {
      const [summaryRes, subsRes] = await Promise.all([
        dashboardAPI.getSummary(),
        subscriptionAPI.list(),
      ]);
      setSummary(summaryRes.data.data);
      setUserSubs(subsRes.data.data.subscriptions);
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map each app to its ideal category
  const APP_CATEGORY_MAP = {
    'netflix': { name: 'Entertainment', color: '#E50914', icon: '🎬' },
    'spotify': { name: 'Music', color: '#1DB954', icon: '🎵' },
    'amazon prime': { name: 'Shopping', color: '#00A8E1', icon: '🛒' },
    'youtube premium': { name: 'Entertainment', color: '#FF0000', icon: '🎬' },
    'discord nitro': { name: 'Gaming', color: '#5865F2', icon: '🎮' },
  };

  // Handle subscribing to a default app
  const handleDefaultAppSubscribe = async (payload) => {
    // 1. Load existing categories
    let cats = [];
    try {
      const catRes = await categoryAPI.list();
      cats = catRes.data.data.categories;
    } catch { /* ignore */ }

    // 2. Determine the right category for this app
    const appKey = payload.name.toLowerCase();
    const categoryInfo = APP_CATEGORY_MAP[appKey] || { name: 'Other', color: '#95A5A6', icon: '📦' };

    // 3. Find existing category or create one
    let category = cats.find(c => c.name === categoryInfo.name);
    if (!category) {
      try {
        const createRes = await categoryAPI.create(categoryInfo);
        category = createRes.data.data.category;
      } catch (err) {
        // Category may already exist (race condition) — retry fetch
        const retryRes = await categoryAPI.list();
        cats = retryRes.data.data.categories;
        category = cats.find(c => c.name === categoryInfo.name) || cats[0];
      }
    }

    if (!category?._id) {
      throw new Error('Could not resolve category. Please try again.');
    }

    await subscriptionAPI.create({
      ...payload,
      categoryId: category._id,
    });
    // Refresh dashboard
    await loadData();
  };

  // Handle custom subscription creation
  const handleCustomCreate = async (payload) => {
    await subscriptionAPI.create(payload);
    setShowCustomForm(false);
    await loadData();
  };

  // Derive subscription status for display
  const getDisplayStatus = (sub) => {
    if (sub.status === 'cancelled') return 'cancelled';
    if (sub.status === 'paused') return 'paused';
    if (sub.status === 'expiring') return 'expiring';
    const nextDate = sub.nextPaymentDate ? new Date(sub.nextPaymentDate) : null;
    if (nextDate && isWithinInterval(nextDate, { start: new Date(), end: addDays(new Date(), 3) })) {
      return 'expiring';
    }
    return sub.status;
  };

  if (loading) {
    return (
      <div className="dash-page animate-fade-in">
        <div className="dash-stats stagger-children">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card">
              <div className="skeleton skeleton-circle" style={{ width: 44, height: 44 }}></div>
              <div className="skeleton skeleton-heading" style={{ marginTop: 12 }}></div>
              <div className="skeleton skeleton-text"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const statCards = [
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="3"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, bg: 'var(--primary-light)', color: 'var(--primary)', label: 'Active Subs', value: summary.activeCount },
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, bg: 'var(--success-light)', color: 'var(--success)', label: 'Monthly Cost', value: fmt(summary.totalMonthly) },
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, bg: 'var(--warning-light)', color: 'var(--warning)', label: 'Yearly Cost', value: fmt(summary.totalYearly) },
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, bg: 'var(--info-light)', color: 'var(--info)', label: 'Upcoming (7d)', value: summary.upcoming.length },
  ];

  const maxSpend = Math.max(...summary.categorySpend.map(c => c.total), 1);

  // Separate default app subs from custom subs
  const defaultAppNames = DEFAULT_APPS.map(a => a.name.toLowerCase());
  const activeSubs = userSubs.filter(s => ['active', 'trial', 'expiring'].includes(s.status));
  const defaultSubs = activeSubs.filter(s => defaultAppNames.includes(s.name.toLowerCase()));
  const customSubs = activeSubs.filter(s => !defaultAppNames.includes(s.name.toLowerCase()));

  return (
    <div className="dash-page animate-fade-in-up">
      {/* Welcome */}
      <div className="dash-welcome">
        <h1 className="dash-welcome-title">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'User'}</span>
        </h1>
        <p className="text-secondary">Here's your subscription overview</p>
      </div>

      {/* Quick Subscribe — Default Apps */}
      <div className="dash-quick-subscribe">
        <div className="dash-section-header" style={{ padding: 0, border: 'none', marginBottom: 'var(--space-md)' }}>
          <h3 className="font-semibold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: 16, height: 16, marginRight: 8, verticalAlign: 'text-bottom' }}>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            Quick Subscribe
          </h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCustomForm(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 14, height: 14 }}>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Custom
          </button>
        </div>
        <div className="dash-apps-grid">
          {DEFAULT_APPS.map((app) => (
            <DefaultAppCard
              key={app.id}
              app={app}
              userSubscriptions={userSubs}
              onSubscribe={handleDefaultAppSubscribe}
            />
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dash-stats stagger-children">
        {statCards.map((s, i) => (
          <div className="stat-card hover-lift" key={i}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* My Subscriptions — Card Grid */}
      {activeSubs.length > 0 && (
        <div className="dash-my-subs">
          <div className="dash-section-header" style={{ padding: 0, border: 'none', marginBottom: 'var(--space-md)' }}>
            <h3 className="font-semibold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: 16, height: 16, marginRight: 8, verticalAlign: 'text-bottom' }}>
                <rect x="1" y="4" width="22" height="16" rx="3"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              My Subscriptions
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/subscriptions')}>View all</button>
          </div>

          {/* Default App Subscriptions */}
          {defaultSubs.length > 0 && (
            <>
              <p className="dash-sub-section-label">Popular Apps</p>
              <div className="dash-sub-cards stagger-children">
                {defaultSubs.map((sub) => {
                  const appData = DEFAULT_APPS.find(a => a.name.toLowerCase() === sub.name.toLowerCase());
                  const displayStatus = getDisplayStatus(sub);
                  const nextDate = sub.nextPaymentDate ? new Date(sub.nextPaymentDate) : null;
                  return (
                    <div className="dash-sub-card glass-card" key={sub._id} style={{ '--card-accent': appData?.color || 'var(--primary)' }}>
                      <div className="dash-sub-card-top">
                        {appData && (
                          <div className="dash-sub-card-logo" dangerouslySetInnerHTML={{ __html: appData.logo }} />
                        )}
                        <div className="dash-sub-card-info">
                          <h4 className="dash-sub-card-name">{sub.name}</h4>
                          <span className="dash-sub-card-plan">{sub.billingCycle === 'custom' ? 'Quarterly' : sub.billingCycle}</span>
                        </div>
                        <span className={`status-badge ${displayStatus}`}>{displayStatus === 'expiring' ? 'Expiring Soon' : displayStatus}</span>
                      </div>
                      <div className="dash-sub-card-bottom">
                        <div className="dash-sub-card-cost">
                          <span className="cost-amount">{fmt(sub.cost)}</span>
                          <span className="cost-cycle">{getCycleLabel(sub.billingCycle, sub.customCycleDays)}</span>
                        </div>
                        <div className="dash-sub-card-next">
                          <span className="text-muted text-xs">Next billing</span>
                          <span className={`text-sm font-medium ${displayStatus === 'expiring' ? 'text-warning' : ''}`}>
                            {nextDate ? format(nextDate, 'MMM dd, yyyy') : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Custom Subscriptions */}
          {customSubs.length > 0 && (
            <>
              <p className="dash-sub-section-label" style={{ marginTop: 'var(--space-lg)' }}>Custom Subscriptions</p>
              <div className="dash-sub-cards stagger-children">
                {customSubs.map((sub) => {
                  const displayStatus = getDisplayStatus(sub);
                  const nextDate = sub.nextPaymentDate ? new Date(sub.nextPaymentDate) : null;
                  return (
                    <div className="dash-sub-card glass-card" key={sub._id} style={{ '--card-accent': sub.categoryId?.color || 'var(--primary)' }}>
                      <div className="dash-sub-card-top">
                        <div className="dash-sub-card-icon" style={{ backgroundColor: (sub.categoryId?.color || '#7C6AF0') + '18' }}>
                          <span>{sub.categoryId?.icon || '📦'}</span>
                        </div>
                        <div className="dash-sub-card-info">
                          <h4 className="dash-sub-card-name">{sub.name}</h4>
                          <span className="dash-sub-card-plan">{sub.categoryId?.name || 'Other'}</span>
                        </div>
                        <span className={`status-badge ${displayStatus}`}>{displayStatus === 'expiring' ? 'Expiring Soon' : displayStatus}</span>
                      </div>
                      <div className="dash-sub-card-bottom">
                        <div className="dash-sub-card-cost">
                          <span className="cost-amount">{fmt(sub.cost)}</span>
                          <span className="cost-cycle">{getCycleLabel(sub.billingCycle, sub.customCycleDays)}</span>
                        </div>
                        <div className="dash-sub-card-next">
                          <span className="text-muted text-xs">Next billing</span>
                          <span className={`text-sm font-medium ${displayStatus === 'expiring' ? 'text-warning' : ''}`}>
                            {nextDate ? format(nextDate, 'MMM dd, yyyy') : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Monthly Spending Summary */}
      {summary.totalMonthly > 0 && (
        <div className="glass-card dash-spending-summary">
          <div className="dash-spending-header">
            <h3 className="font-semibold">Monthly Spending Summary</h3>
            <span className="dash-spending-total">{fmt(summary.totalMonthly)}<span className="text-muted text-sm">/mo</span></span>
          </div>
          <div className="dash-spending-bar-bg">
            <div className="dash-spending-bar-fill" style={{ width: '100%' }}></div>
          </div>
          {user?.budgetLimit && (
            <div className="dash-spending-budget">
              <span className="text-sm text-muted">Budget: {fmt(user.budgetLimit)}/mo</span>
              <span className={`text-sm font-medium ${summary.totalMonthly > user.budgetLimit ? 'text-danger' : 'text-success'}`}>
                {summary.totalMonthly > user.budgetLimit ? 'Over budget' : `${Math.round((summary.totalMonthly / user.budgetLimit) * 100)}% used`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content Grid */}
      <div className="dash-grid">
        {/* Upcoming Renewals */}
        <div className="glass-card dash-section">
          <div className="dash-section-header">
            <h3 className="font-semibold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{width:16,height:16,marginRight:8,verticalAlign:'text-bottom'}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Upcoming Renewals
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/subscriptions')}>View all</button>
          </div>
          {summary.upcoming.length === 0 ? (
            <p className="text-muted text-sm" style={{ padding: 'var(--space-lg)' }}>No upcoming payments in the next 7 days 🎉</p>
          ) : (
            <div className="dash-list">
              {summary.upcoming.map((sub) => (
                <div className="dash-list-item" key={sub._id}>
                  <div className="dash-list-icon" style={{ background: (sub.categoryId?.color || '#7C6AF0') + '18' }}>
                    {sub.categoryId?.icon || '📦'}
                  </div>
                  <div className="dash-list-info">
                    <span className="font-medium">{sub.name}</span>
                    <span className="text-xs text-muted">{formatDistanceToNow(new Date(sub.nextPaymentDate), { addSuffix: true })}</span>
                  </div>
                  <span className="font-semibold">{fmt(sub.cost)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="glass-card dash-section">
          <div className="dash-section-header">
            <h3 className="font-semibold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{width:16,height:16,marginRight:8,verticalAlign:'text-bottom'}}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              Spending by Category
            </h3>
          </div>
          {summary.categorySpend.length === 0 ? (
            <p className="text-muted text-sm" style={{ padding: 'var(--space-lg)' }}>No active subscriptions yet</p>
          ) : (
            <div className="dash-category-list">
              {summary.categorySpend.map((cat) => (
                <div className="dash-category-item" key={cat.name}>
                  <div className="dash-category-info">
                    <span className="dash-category-dot" style={{ background: cat.color }}></span>
                    <span>{cat.icon} {cat.name}</span>
                    <span className="text-muted text-xs">({cat.count})</span>
                  </div>
                  <div className="dash-category-bar-wrap">
                    <div className="dash-category-bar" style={{ width: `${(cat.total / maxSpend) * 100}%`, background: cat.color }} />
                  </div>
                  <span className="font-medium text-sm">{fmt(cat.total)}/mo</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="glass-card dash-section">
          <div className="dash-section-header">
            <h3 className="font-semibold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{width:16,height:16,marginRight:8,verticalAlign:'text-bottom'}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Status Overview
            </h3>
          </div>
          <div className="dash-status-grid">
            {Object.entries(summary.statusCounts).map(([status, count]) => (
              <div className="dash-status-item" key={status}>
                <span className={`status-badge ${status}`}>{status}</span>
                <span className="text-2xl font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Expensive */}
        <div className="glass-card dash-section">
          <div className="dash-section-header">
            <h3 className="font-semibold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{width:16,height:16,marginRight:8,verticalAlign:'text-bottom'}}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              Most Expensive
            </h3>
          </div>
          {summary.mostExpensive.length === 0 ? (
            <p className="text-muted text-sm" style={{ padding: 'var(--space-lg)' }}>No subscriptions yet</p>
          ) : (
            <div className="dash-list">
              {summary.mostExpensive.map((sub, i) => (
                <div className="dash-list-item" key={sub._id}>
                  <span className="dash-rank">#{i + 1}</span>
                  <div className="dash-list-info">
                    <span className="font-medium">{sub.name}</span>
                    <span className="text-xs text-muted">{sub.billingCycle}</span>
                  </div>
                  <span className="font-semibold">{fmt(sub.monthlyCost)}/mo</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overdue alert */}
      {summary.overdue.length > 0 && (
        <div className="dash-alert animate-bounce-in">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:20,height:20,flexShrink:0}}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span><strong>{summary.overdue.length}</strong> subscription{summary.overdue.length > 1 ? 's' : ''} overdue! Check your payments.</span>
        </div>
      )}

      {/* Custom Subscription Form Modal */}
      {showCustomForm && (
        <SubscriptionForm
          subscription={null}
          onSubmit={handleCustomCreate}
          onClose={() => setShowCustomForm(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
