import { format } from 'date-fns';

const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency', currency: currency || 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(amount);
};

const cycleLabelMap = { monthly: 'Monthly', yearly: 'Yearly', custom: 'Custom' };

/**
 * Hidden, print-optimised component used as the PDF target.
 * Rendered off-screen and captured by react-to-pdf.
 */
const SubscriptionReport = ({ subscriptions, currency, innerRef }) => {
  const symbol = currency === 'INR' ? '₹' : '$';

  const activeSubs = subscriptions.filter((s) => s.status === 'active' || s.status === 'trial');
  const totalMonthly = activeSubs.reduce((sum, s) => {
    if (s.billingCycle === 'monthly') return sum + s.cost;
    if (s.billingCycle === 'yearly') return sum + s.cost / 12;
    if (s.billingCycle === 'custom') return sum + (s.cost / (s.customCycleDays || 30)) * 30;
    return sum;
  }, 0);
  const totalYearly = totalMonthly * 12;

  const today = format(new Date(), 'MMMM dd, yyyy');

  return (
    <div
      ref={innerRef}
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 0,
        width: '800px',
        background: '#ffffff',
        color: '#1a1a2e',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        padding: '48px 40px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', borderBottom: '3px solid #7C6AF0', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#7C6AF0', letterSpacing: '-0.5px' }}>
            📋 SubTrackr
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
            Subscription Management Report
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#6b7280' }}>
          <p style={{ margin: 0 }}>Generated on</p>
          <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#1a1a2e' }}>{today}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <div style={{ flex: 1, background: '#f0edff', borderRadius: '10px', padding: '16px 20px' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Subscriptions</p>
          <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 700, color: '#7C6AF0' }}>{subscriptions.length}</p>
        </div>
        <div style={{ flex: 1, background: '#e6faf2', borderRadius: '10px', padding: '16px 20px' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active / Trial</p>
          <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 700, color: '#10B981' }}>{activeSubs.length}</p>
        </div>
        <div style={{ flex: 1, background: '#fef3e2', borderRadius: '10px', padding: '16px 20px' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Est. Monthly</p>
          <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 700, color: '#F59E0B' }}>{symbol}{totalMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div style={{ flex: 1, background: '#fce4ec', borderRadius: '10px', padding: '16px 20px' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Est. Yearly</p>
          <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 700, color: '#EF4444' }}>{symbol}{totalYearly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* Subscriptions Table */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#1a1a2e' }}>
        All Subscriptions
      </h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: '#7C6AF0', color: '#ffffff' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, borderRadius: '8px 0 0 0' }}>#</th>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Name</th>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Category</th>
            <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>Cost</th>
            <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Cycle</th>
            <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Status</th>
            <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, borderRadius: '0 8px 0 0' }}>Next Payment</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub, idx) => {
            const statusColors = {
              active: { bg: '#e6faf2', text: '#059669' },
              trial: { bg: '#e0f2fe', text: '#0284c7' },
              expiring: { bg: '#fef3e2', text: '#d97706' },
              paused: { bg: '#f3f4f6', text: '#6b7280' },
              cancelled: { bg: '#fce4ec', text: '#dc2626' },
            };
            const sc = statusColors[sub.status] || statusColors.active;

            return (
              <tr key={sub._id} style={{ background: idx % 2 === 0 ? '#fafafa' : '#ffffff', borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px 12px', color: '#9ca3af' }}>{idx + 1}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1a1a2e' }}>{sub.name}</td>
                <td style={{ padding: '10px 12px', color: '#6b7280' }}>
                  {sub.categoryId?.icon || '📦'} {sub.categoryId?.name || 'Uncategorized'}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(sub.cost, currency)}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center', color: '#6b7280' }}>
                  {cycleLabelMap[sub.billingCycle] || sub.billingCycle}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                    background: sc.bg, color: sc.text,
                  }}>
                    {sub.status}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#6b7280' }}>
                  {sub.nextPaymentDate ? format(new Date(sub.nextPaymentDate), 'MMM dd, yyyy') : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af' }}>
        <span>SubTrackr · Subscription Management App</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
};

export default SubscriptionReport;
