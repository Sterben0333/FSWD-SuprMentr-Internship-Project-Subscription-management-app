import { format } from 'date-fns';
import useAuthStore from '../../store/authStore';
import './SubscriptionCard.css';

const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currency || 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const SubscriptionCard = ({ subscription, onEdit, onDelete }) => {
  const currency = useAuthStore((s) => s.user?.currency) || 'INR';
  const {
    name,
    cost,
    billingCycle,
    status,
    nextPaymentDate,
    categoryId: category,
  } = subscription;

  const cycleLabelMap = {
    monthly: '/mo',
    yearly: '/yr',
    custom: `/custom`,
  };

  return (
    <div className="sub-card glass-card">
      <div className="sub-card-header">
        <div className="sub-card-info">
          <div className="sub-card-icon" style={{ backgroundColor: category?.color + '22' }}>
            <span>{category?.icon || '📦'}</span>
          </div>
          <div>
            <h3 className="sub-card-name">{name}</h3>
            <span className="sub-card-category">{category?.name || 'Uncategorized'}</span>
          </div>
        </div>
        <span className={`status-badge ${status}`}>{status}</span>
      </div>

      <div className="sub-card-body">
        <div className="sub-card-price">
          <span className="sub-card-amount">{formatCurrency(cost, currency)}</span>
          <span className="sub-card-cycle">{cycleLabelMap[billingCycle]}</span>
        </div>
        <div className="sub-card-next">
          <span className="text-muted text-sm">Next payment</span>
          <span className="text-sm font-medium">
            {nextPaymentDate ? format(new Date(nextPaymentDate), 'MMM dd, yyyy') : '—'}
          </span>
        </div>
      </div>

      <div className="sub-card-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(subscription)}>
          ✏️ Edit
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onDelete(subscription._id)} style={{ color: 'var(--danger)' }}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default SubscriptionCard;
