import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import useAuthStore from '../../store/authStore';
import { dashboardAPI } from './dashboardAPI';
import './DashboardPage.css';

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const currency = user?.currency || 'INR';

  const fmt = (amount) =>
    new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await dashboardAPI.getSummary();
        setSummary(data.data);
      } catch (err) {
        console.error('Dashboard load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
    { icon: '💳', bg: 'var(--primary-light)', label: 'Active Subs', value: summary.activeCount },
    { icon: '💰', bg: 'var(--success-light)', label: 'Monthly Cost', value: fmt(summary.totalMonthly) },
    { icon: '📅', bg: 'var(--warning-light)', label: 'Yearly Cost', value: fmt(summary.totalYearly) },
    { icon: '⚡', bg: 'var(--info-light)', label: 'Upcoming (7d)', value: summary.upcoming.length },
  ];

  return (
    <div className="dash-page animate-fade-in-up">
      {/* Welcome */}
      <div className="dash-welcome">
        <h1 className="text-2xl font-bold">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'User'}</span>
        </h1>
        <p className="text-secondary">Here's your subscription overview</p>
      </div>

      {/* Stat Cards */}
      <div className="dash-stats stagger-children">
        {statCards.map((s, i) => (
          <div className="stat-card hover-lift" key={i}>
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="dash-grid">
        {/* Upcoming Payments */}
        <div className="glass-card dash-section">
          <div className="dash-section-header">
            <h3 className="font-semibold">⏰ Upcoming Payments</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/subscriptions')}>
              View all
            </button>
          </div>
          {summary.upcoming.length === 0 ? (
            <p className="text-muted text-sm" style={{ padding: 'var(--space-md)' }}>
              No upcoming payments in the next 7 days 🎉
            </p>
          ) : (
            <div className="dash-list">
              {summary.upcoming.map((sub) => (
                <div className="dash-list-item" key={sub._id}>
                  <div className="dash-list-icon" style={{ background: (sub.categoryId?.color || '#6C5CE7') + '22' }}>
                    {sub.categoryId?.icon || '📦'}
                  </div>
                  <div className="dash-list-info">
                    <span className="font-medium">{sub.name}</span>
                    <span className="text-xs text-muted">
                      {format(new Date(sub.nextPaymentDate), 'MMM dd')}
                    </span>
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
            <h3 className="font-semibold">📂 Spending by Category</h3>
          </div>
          {summary.categorySpend.length === 0 ? (
            <p className="text-muted text-sm" style={{ padding: 'var(--space-md)' }}>
              No active subscriptions yet
            </p>
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
                    <div
                      className="dash-category-bar"
                      style={{
                        width: `${(cat.total / summary.totalMonthly) * 100}%`,
                        background: cat.color,
                      }}
                    />
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
            <h3 className="font-semibold">📊 Status Overview</h3>
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
            <h3 className="font-semibold">🔥 Most Expensive</h3>
          </div>
          {summary.mostExpensive.length === 0 ? (
            <p className="text-muted text-sm" style={{ padding: 'var(--space-md)' }}>
              No subscriptions yet
            </p>
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
          <span>⚠️</span>
          <span>
            <strong>{summary.overdue.length}</strong> subscription{summary.overdue.length > 1 ? 's' : ''} overdue!
            {' '}Check your payments.
          </span>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
