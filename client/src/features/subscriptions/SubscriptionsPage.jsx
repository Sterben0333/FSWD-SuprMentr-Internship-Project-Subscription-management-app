import { useState, useEffect, useCallback } from 'react';
import useSubscriptionStore from '../../store/subscriptionStore';
import { subscriptionAPI, categoryAPI } from './subscriptionAPI';
import SubscriptionCard from './SubscriptionCard';
import SubscriptionForm from './SubscriptionForm';
import './SubscriptionsPage.css';

const SubscriptionsPage = () => {
  const {
    subscriptions,
    filter,
    isLoading,
    setSubscriptions,
    addSubscription,
    updateSubscription,
    removeSubscription,
    setFilter,
    resetFilters,
    setLoading,
  } = useSubscriptionStore();

  const [showForm, setShowForm] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [categories, setCategories] = useState([]);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.status !== 'all') params.status = filter.status;
      if (filter.categoryId !== 'all') params.categoryId = filter.categoryId;
      if (filter.search) params.search = filter.search;

      const { data } = await subscriptionAPI.list(params);
      setSubscriptions(data.data.subscriptions);
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, setSubscriptions, setLoading]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  useEffect(() => {
    categoryAPI.list().then(({ data }) => {
      setCategories(data.data.categories);
    }).catch(console.error);
  }, []);

  const handleCreate = async (payload) => {
    const { data } = await subscriptionAPI.create(payload);
    addSubscription(data.data.subscription);
    setShowForm(false);
  };

  const handleUpdate = async (payload) => {
    const { data } = await subscriptionAPI.update(editingSub._id, payload);
    updateSubscription(editingSub._id, data.data.subscription);
    setEditingSub(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this subscription?')) return;
    try {
      await subscriptionAPI.delete(id);
      removeSubscription(id);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleEdit = (sub) => {
    setEditingSub(sub);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSub(null);
  };

  // Derived stats
  const activeCount = subscriptions.filter((s) => s.status === 'active' || s.status === 'trial').length;
  const totalMonthly = subscriptions
    .filter((s) => s.status === 'active' || s.status === 'trial')
    .reduce((sum, s) => {
      if (s.billingCycle === 'monthly') return sum + s.cost;
      if (s.billingCycle === 'yearly') return sum + s.cost / 12;
      if (s.billingCycle === 'custom') return sum + (s.cost / (s.customCycleDays || 30)) * 30;
      return sum;
    }, 0);

  return (
    <div className="subs-page animate-fade-in-up">
      <div className="subs-header">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-secondary text-sm">
            {activeCount} active · est. {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalMonthly)}/mo
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Subscription
        </button>
      </div>

      {/* Filters */}
      <div className="subs-filters">
        <input
          type="text"
          placeholder="🔍 Search subscriptions..."
          value={filter.search}
          onChange={(e) => setFilter({ search: e.target.value })}
          className="subs-search"
        />
        <select
          value={filter.status}
          onChange={(e) => setFilter({ status: e.target.value })}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="expiring">Expiring</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={filter.categoryId}
          onChange={(e) => setFilter({ categoryId: e.target.value })}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
          ))}
        </select>
        {(filter.status !== 'all' || filter.categoryId !== 'all' || filter.search) && (
          <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
            Clear
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="subs-grid stagger-children">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="sub-card glass-card">
              <div className="skeleton skeleton-heading"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
            </div>
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💳</div>
          <h3>No subscriptions yet</h3>
          <p>Add your first subscription to start tracking your spending.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add Subscription
          </button>
        </div>
      ) : (
        <div className="subs-grid stagger-children">
          {subscriptions.map((sub) => (
            <SubscriptionCard
              key={sub._id}
              subscription={sub}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <SubscriptionForm
          subscription={editingSub}
          onSubmit={editingSub ? handleUpdate : handleCreate}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default SubscriptionsPage;
