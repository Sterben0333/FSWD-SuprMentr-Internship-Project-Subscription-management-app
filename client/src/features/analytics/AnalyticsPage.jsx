import { useState, useEffect } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import useAuthStore from '../../store/authStore';
import { analyticsAPI } from './analyticsAPI';
import './AnalyticsPage.css';

const CHART_COLORS = ['#7C6AF0', '#22D3EE', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#A78BFA', '#F472B6'];

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const currency = useAuthStore((s) => s.user?.currency) || 'INR';
  const symbol = currency === 'INR' ? '₹' : '$';

  useEffect(() => {
    analyticsAPI.get()
      .then(({ data: res }) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="analytics-page animate-fade-in">
        <h1 className="text-2xl font-bold" style={{ marginBottom: 'var(--space-lg)', letterSpacing: 'var(--letter-spacing-tight)' }}>Analytics</h1>
        <div className="analytics-grid stagger-children">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card" style={{ padding: 'var(--space-xl)', minHeight: 300 }}>
              <div className="skeleton skeleton-heading"></div>
              <div className="skeleton" style={{ height: 200, marginTop: 16 }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="chart-tooltip">
        <p className="font-medium">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {symbol}{p.value.toLocaleString()}</p>
        ))}
      </div>
    );
  };

  const summaryStats = [
    { label: 'Total Monthly', value: `${symbol}${data.totalMonthly.toLocaleString()}`, color: 'var(--primary)' },
    { label: 'Active Subs', value: data.totalActive, color: 'var(--success)' },
    { label: 'Categories', value: data.categoryDistribution.length, color: 'var(--accent)' },
  ];

  return (
    <div className="analytics-page animate-fade-in-up">
      <div className="analytics-header">
        <div>
          <h1 className="text-2xl font-bold" style={{ letterSpacing: 'var(--letter-spacing-tight)' }}>Analytics</h1>
          <p className="text-secondary text-sm">
            {data.totalActive} active subscriptions · {symbol}{data.totalMonthly.toLocaleString()}/mo
          </p>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="analytics-summary stagger-children">
        {summaryStats.map((s, i) => (
          <div className="analytics-stat-pill" key={i}>
            <span className="analytics-stat-dot" style={{ background: s.color }}></span>
            <span className="analytics-stat-label">{s.label}</span>
            <span className="analytics-stat-value">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        {/* Monthly Trend */}
        <div className="glass-card chart-card chart-wide">
          <h3 className="chart-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{width:16,height:16,marginRight:8,verticalAlign:'text-bottom'}}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Monthly Spending Trend
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.monthlyTrend}>
              <defs>
                <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C6AF0" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#7C6AF0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `${symbol}${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cost" name="Monthly Cost" stroke="#7C6AF0" strokeWidth={2.5} fill="url(#gradientArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="glass-card chart-card">
          <h3 className="chart-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{width:16,height:16,marginRight:8,verticalAlign:'text-bottom'}}><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/><path d="M12 2v20"/></svg>
            By Category
          </h3>
          {data.categoryDistribution.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-xl)' }}><p className="text-muted">No data yet</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={data.categoryDistribution} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {data.categoryDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${symbol}${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Billing Cycle */}
        <div className="glass-card chart-card">
          <h3 className="chart-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{width:16,height:16,marginRight:8,verticalAlign:'text-bottom'}}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Billing Cycle
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.cycleDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" name="Subscriptions" radius={[6, 6, 0, 0]}>
                {data.cycleDistribution.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Ranges */}
        <div className="glass-card chart-card chart-wide">
          <h3 className="chart-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{width:16,height:16,marginRight:8,verticalAlign:'text-bottom'}}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Cost Distribution
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.costRanges} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
              <YAxis dataKey="range" type="category" stroke="var(--text-muted)" fontSize={12} width={80} />
              <Tooltip />
              <Bar dataKey="count" name="Subscriptions" fill="#22D3EE" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
