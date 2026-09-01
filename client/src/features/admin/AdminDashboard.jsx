import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../auth/authService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Maintenance mode state
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [maintenanceInfo, setMaintenanceInfo] = useState(null);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  const loadMaintenanceStatus = useCallback(async () => {
    try {
      const { data } = await adminAPI.getMaintenanceStatus();
      setMaintenanceEnabled(data.data.isEnabled);
      setMaintenanceMessage(data.data.message || '');
      setMaintenanceInfo(data.data);
    } catch {
      // Silent fail — not critical
    }
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await adminAPI.getStats();
        setStats(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin stats');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
    loadMaintenanceStatus();
  }, [loadMaintenanceStatus]);

  const handleMaintenanceToggle = async () => {
    const newState = !maintenanceEnabled;
    const confirmMsg = newState
      ? 'Are you sure you want to ENABLE maintenance mode? All non-admin users will be blocked from accessing the application.'
      : 'Are you sure you want to DISABLE maintenance mode? Users will be able to access the application again.';

    if (!window.confirm(confirmMsg)) return;

    setMaintenanceLoading(true);
    try {
      const { data } = await adminAPI.toggleMaintenance({
        isEnabled: newState,
        message: maintenanceMessage,
      });
      setMaintenanceEnabled(data.data.isEnabled);
      setMaintenanceInfo(data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle maintenance mode');
    } finally {
      setMaintenanceLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard animate-fade-in">
        <div className="admin-header">
          <h1 className="admin-title">
            <span className="admin-icon">🛡️</span>
            Admin <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-secondary">Loading admin statistics...</p>
        </div>
        <div className="admin-stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="admin-stat-card">
              <div className="skeleton skeleton-circle" style={{ width: 48, height: 48 }}></div>
              <div className="skeleton skeleton-heading" style={{ marginTop: 12 }}></div>
              <div className="skeleton skeleton-text"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard animate-fade-in">
        <div className="admin-error glass-card">
          <span className="admin-error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      label: 'Total Users',
      value: stats.totalUsers,
      color: 'var(--primary)',
      bg: 'var(--primary-light)',
      description: 'Registered accounts',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      ),
      label: 'New (30 days)',
      value: stats.newUsersLast30Days,
      color: 'var(--success)',
      bg: 'var(--success-light)',
      description: 'Last 30 days signups',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      label: 'New (7 days)',
      value: stats.newUsersLast7Days,
      color: 'var(--warning)',
      bg: 'var(--warning-light)',
      description: 'Last 7 days signups',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect x="1" y="4" width="22" height="16" rx="3" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
      label: 'Active Subs',
      value: `${stats.activeSubscriptions} / ${stats.totalSubscriptions}`,
      color: 'var(--info)',
      bg: 'var(--info-light)',
      description: 'Active / Total subscriptions',
    },
  ];

  return (
    <div className="admin-dashboard animate-fade-in-up">
      {/* Header */}
      <div className="admin-header">
        <h1 className="admin-title">
          <span className="admin-icon">🛡️</span>
          Admin <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-secondary">Platform overview and user activity</p>
      </div>

      {/* Maintenance Mode Card */}
      <div className={`admin-maintenance-card glass-card ${maintenanceEnabled ? 'maintenance-active' : ''}`} id="maintenance-mode-card">
        <div className="admin-maintenance-header">
          <div className="admin-maintenance-left">
            <div className="admin-maintenance-icon">
              🔧
            </div>
            <div className="admin-maintenance-info">
              <h3>Maintenance Mode</h3>
              <p>Block user access for scheduled maintenance</p>
            </div>
          </div>

          <div className="admin-maintenance-right">
            <span className={`maintenance-status-badge ${maintenanceEnabled ? 'maintenance-status-badge--active' : 'maintenance-status-badge--inactive'}`}>
              {maintenanceEnabled ? 'Active' : 'Inactive'}
            </span>

            <label className="toggle-switch" title={maintenanceEnabled ? 'Disable maintenance mode' : 'Enable maintenance mode'}>
              <input
                type="checkbox"
                checked={maintenanceEnabled}
                onChange={handleMaintenanceToggle}
                disabled={maintenanceLoading}
                id="maintenance-toggle"
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        <div className="admin-maintenance-message">
          <label htmlFor="maintenance-message-input">Custom message (optional)</label>
          <textarea
            id="maintenance-message-input"
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
            placeholder="We're currently performing some maintenance to improve your experience. We'll be back shortly!"
            maxLength={500}
          />
          {maintenanceEnabled && maintenanceInfo?.enabledAt && (
            <div className="maintenance-enabled-info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>
                Enabled {new Date(maintenanceInfo.enabledAt).toLocaleString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
                {maintenanceInfo.enabledBy ? ` by ${maintenanceInfo.enabledBy}` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="admin-stats-grid stagger-children">
        {statCards.map((s, i) => (
          <div className="admin-stat-card hover-lift glass-card" key={i}>
            <div className="admin-stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className="admin-stat-value">{s.value}</div>
            <div className="admin-stat-label">{s.label}</div>
            <div className="admin-stat-description">{s.description}</div>
          </div>
        ))}
      </div>

      {/* User Table */}
      <div className="admin-users-section glass-card">
        <div className="admin-users-header">
          <h3 className="font-semibold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: 16, height: 16, marginRight: 8, verticalAlign: 'text-bottom' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            Registered Users
          </h3>
          <span className="admin-users-count">{stats.totalUsers} total</span>
        </div>

        {stats.users.length === 0 ? (
          <p className="text-muted text-sm" style={{ padding: 'var(--space-lg)' }}>
            No users have registered yet.
          </p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table" id="admin-users-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Subscriptions</th>
                </tr>
              </thead>
              <tbody>
                {stats.users.map((user, index) => (
                  <tr key={user._id} className="admin-table-row">
                    <td className="admin-table-rank">{index + 1}</td>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="text-secondary">{user.email}</td>
                    <td className="text-secondary">
                      {new Date(user.joinedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <span className={`admin-sub-badge ${user.subscriptionCount > 0 ? 'has-subs' : ''}`}>
                        {user.subscriptionCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

