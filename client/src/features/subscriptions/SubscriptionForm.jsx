import { useState, useEffect } from 'react';
import { categoryAPI } from './subscriptionAPI';
import './SubscriptionForm.css';

const INITIAL_STATE = {
  name: '',
  cost: '',
  billingCycle: 'monthly',
  customCycleDays: '',
  categoryId: '',
  status: 'active',
  startDate: new Date().toISOString().split('T')[0],
  nextPaymentDate: '',
  trialEndDate: '',
  notes: '',
};

const SubscriptionForm = ({ subscription, onSubmit, onClose }) => {
  const isEdit = !!subscription;
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    if (subscription) {
      setFormData({
        name: subscription.name || '',
        cost: subscription.cost || '',
        billingCycle: subscription.billingCycle || 'monthly',
        customCycleDays: subscription.customCycleDays || '',
        categoryId: subscription.categoryId?._id || subscription.categoryId || '',
        status: subscription.status || 'active',
        startDate: subscription.startDate
          ? new Date(subscription.startDate).toISOString().split('T')[0]
          : '',
        nextPaymentDate: subscription.nextPaymentDate
          ? new Date(subscription.nextPaymentDate).toISOString().split('T')[0]
          : '',
        trialEndDate: subscription.trialEndDate
          ? new Date(subscription.trialEndDate).toISOString().split('T')[0]
          : '',
        notes: subscription.notes || '',
      });
    }
  }, [subscription]);

  const loadCategories = async () => {
    try {
      const { data } = await categoryAPI.list();
      setCategories(data.data.categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        cost: parseFloat(formData.cost),
        customCycleDays: formData.billingCycle === 'custom' && formData.customCycleDays
          ? parseInt(formData.customCycleDays) : null,
        trialEndDate: formData.status === 'trial' && formData.trialEndDate
          ? formData.trialEndDate : null,
        nextPaymentDate: formData.nextPaymentDate || undefined,
        notes: formData.notes || null,
      };

      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content sub-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Subscription' : 'New Subscription'}</h2>
          <button className="btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <form id="sub-form" className="modal-body sub-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-grid">
            <div className="input-group">
              <label htmlFor="sub-name">Name</label>
              <input
                id="sub-name"
                name="name"
                placeholder="e.g. Netflix, Spotify"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="sub-cost">Cost</label>
              <input
                id="sub-cost"
                name="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.cost}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="sub-category">Category</label>
              <select
                id="sub-category"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="sub-cycle">Billing Cycle</label>
              <select
                id="sub-cycle"
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleChange}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {formData.billingCycle === 'custom' && (
              <div className="input-group">
                <label htmlFor="sub-custom-days">Custom Cycle (days)</label>
                <input
                  id="sub-custom-days"
                  name="customCycleDays"
                  type="number"
                  min="1"
                  placeholder="e.g. 90"
                  value={formData.customCycleDays}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="sub-status">Status</label>
              <select
                id="sub-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="expiring">Expiring</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="sub-start">Start Date</label>
              <input
                id="sub-start"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label htmlFor="sub-next">Next Payment</label>
              <input
                id="sub-next"
                name="nextPaymentDate"
                type="date"
                value={formData.nextPaymentDate}
                onChange={handleChange}
              />
            </div>

            {formData.status === 'trial' && (
              <div className="input-group">
                <label htmlFor="sub-trial-end">Trial End Date</label>
                <input
                  id="sub-trial-end"
                  name="trialEndDate"
                  type="date"
                  value={formData.trialEndDate}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <div className="input-group" style={{ marginTop: 'var(--space-md)' }}>
            <label htmlFor="sub-notes">Notes (optional)</label>
            <textarea
              id="sub-notes"
              name="notes"
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              maxLength={500}
            />
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="sub-form" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner spinner-sm"></span>
                {isEdit ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              isEdit ? 'Save Changes' : 'Create Subscription'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionForm;
