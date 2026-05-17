import { format, formatDistanceToNow, isPast, isWithinInterval, addDays } from 'date-fns';
import useAuthStore from '../../store/authStore';
import './SubscriptionCard.css';

const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency', currency: currency || 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(amount);
};

const statusColor = {
  active: 'var(--status-active)', trial: 'var(--status-trial)',
  expiring: 'var(--status-expiring)', paused: 'var(--status-paused)', cancelled: 'var(--status-cancelled)',
};

const SubscriptionCard = ({ subscription, onEdit, onDelete }) => {
  const currency = useAuthStore((s) => s.user?.currency) || 'INR';
  const { name, cost, billingCycle, status, nextPaymentDate, categoryId: category } = subscription;

  const cycleLabelMap = { monthly: 'Monthly', yearly: 'Yearly', custom: 'Custom' };
  const cycleShort = { monthly: '/mo', yearly: '/yr', custom: '/custom' };

  const nextDate = nextPaymentDate ? new Date(nextPaymentDate) : null;
  const isOverdue = nextDate && isPast(nextDate);
  const isSoon = nextDate && !isOverdue && isWithinInterval(nextDate, { start: new Date(), end: addDays(new Date(), 7) });

  return (
    <div className="sub-card glass-card" style={{ '--card-accent': statusColor[status] || 'var(--primary)' }}>
      <div className="sub-card-header">
        <div className="sub-card-info">
          <div className="sub-card-icon" style={{ backgroundColor: (category?.color || '#7C6AF0') + '15' }}>
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
          <span className="sub-card-cycle">{cycleShort[billingCycle]}</span>
        </div>
        <div className="sub-card-meta">
          <span className="sub-card-cycle-badge">{cycleLabelMap[billingCycle]}</span>
        </div>
      </div>

      <div className="sub-card-footer">
        <div className="sub-card-next">
          <span className="text-muted text-xs">Next payment</span>
          <span className={`text-sm font-medium ${isOverdue ? 'text-danger' : isSoon ? 'text-warning' : ''}`}>
            {nextDate ? (
              <>
                {format(nextDate, 'MMM dd, yyyy')}
                <span className="sub-card-relative"> · {formatDistanceToNow(nextDate, { addSuffix: true })}</span>
              </>
            ) : '—'}
          </span>
        </div>
        <div className="sub-card-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(subscription)} title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:14,height:14}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button className="btn btn-ghost btn-sm sub-card-delete" onClick={() => onDelete(subscription._id)} title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:14,height:14}}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14H7L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
