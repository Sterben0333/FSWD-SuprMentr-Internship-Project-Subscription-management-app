import { useState } from 'react';
import { getCycleLabel } from '../../data/defaultApps';
import './DefaultAppCard.css';

const DefaultAppCard = ({ app, userSubscriptions, onSubscribe }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user already has an active sub for this app
  const existingSub = userSubscriptions.find(
    (s) =>
      s.name.toLowerCase() === app.name.toLowerCase() &&
      ['active', 'trial'].includes(s.status)
  );

  const handlePlanSelect = (plan) => {
    if (!plan || !plan.name || plan.price == null) return; // guard against null
    setError('');
    setSelectedPlan(plan);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    setError('');
    try {
      await onSubscribe({
        name: app.name,
        cost: selectedPlan.price,
        billingCycle: selectedPlan.billingCycle,
        customCycleDays: selectedPlan.customCycleDays || null,
        startDate: new Date().toISOString().split('T')[0],
        status: 'active',
        logoUrl: null,
      });
      setShowConfirm(false);
      setSelectedPlan(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to subscribe';
      setError(msg);
      setShowConfirm(false);
      // Auto-clear error after 4 seconds
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setSelectedPlan(null);
  };

  const fmt = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div
      className={`default-app-card ${existingSub ? 'subscribed' : ''}`}
      style={{ '--app-color': app.color }}
    >
      {/* Logo */}
      <div className="default-app-logo" dangerouslySetInnerHTML={{ __html: app.logo }} />

      {/* App Name */}
      <h4 className="default-app-name">{app.name}</h4>

      {/* Subscribed badge */}
      {existingSub ? (
        <div className="default-app-subscribed">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Subscribed
        </div>
      ) : (
        <>
          {/* Plan list */}
          <div className="default-app-plans">
            {app.plans.map((plan) => (
              <button
                key={plan.name}
                className={`default-app-plan-btn ${selectedPlan?.name === plan.name ? 'selected' : ''}`}
                onClick={() => handlePlanSelect(plan)}
                type="button"
              >
                <span className="plan-name">{plan.name}</span>
                <span className="plan-price">
                  {fmt(plan.price)}
                  <span className="plan-cycle">{getCycleLabel(plan.billingCycle, plan.customCycleDays)}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Confirmation overlay */}
      {showConfirm && selectedPlan && (
        <div className="default-app-confirm-overlay">
          <div className="default-app-confirm">
            <p className="confirm-title">Subscribe to {app.name}?</p>
            <p className="confirm-detail">
              {selectedPlan.name} — {fmt(selectedPlan.price)}{getCycleLabel(selectedPlan.billingCycle, selectedPlan.customCycleDays)}
            </p>
            <div className="confirm-actions">
              <button className="btn btn-secondary btn-sm" onClick={handleCancel} disabled={loading}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleConfirm} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner spinner-sm"></span>
                    Subscribing...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error toast */}
      {error && <div className="default-app-error">{error}</div>}
    </div>
  );
};

export default DefaultAppCard;
