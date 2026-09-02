import { useEffect, useState } from 'react';
import { Outlet, Navigate, useSearchParams } from 'react-router-dom';
import useMaintenanceStore from '../store/maintenanceStore';
import './AuthLayout.css';

const AuthLayout = () => {
  const { isMaintenanceMode, checkMaintenanceStatus } = useMaintenanceStore();
  const [checked, setChecked] = useState(false);
  const [searchParams] = useSearchParams();

  // Allow staff bypass via ?staff=1 (linked from maintenance page)
  const isStaffBypass = searchParams.get('staff') === '1';

  useEffect(() => {
    checkMaintenanceStatus().then(() => setChecked(true));
  }, [checkMaintenanceStatus]);

  // Wait for the maintenance check
  if (!checked) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  // Redirect to maintenance page if maintenance mode is ON (unless staff bypass)
  if (isMaintenanceMode && !isStaffBypass) {
    return <Navigate to="/maintenance" replace />;
  }

  return (
    <div className="auth-layout">
      {/* for the Animated gradient mesh background */}
      <div className="auth-bg">
        <div className="auth-gradient-mesh"></div>
        <div className="auth-grid-overlay"></div>
        <div className="auth-shape auth-shape-1"></div>
        <div className="auth-shape auth-shape-2"></div>
        <div className="auth-shape auth-shape-3"></div>
        <div className="auth-shape auth-shape-4"></div>
        <div className="auth-shape auth-shape-5"></div>
        {/* the Floating particles */}
        <div className="auth-particles">
          <div className="auth-particle"></div>
          <div className="auth-particle"></div>
          <div className="auth-particle"></div>
          <div className="auth-particle"></div>
          <div className="auth-particle"></div>
          <div className="auth-particle"></div>
          <div className="auth-particle"></div>
          <div className="auth-particle"></div>
        </div>
      </div>

      <div className="auth-container animate-fade-in-up">
        <div className="auth-brand">
          <div className="auth-logo-wrap">
            <svg className="auth-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="3" />
              <line x1="1" y1="10" x2="23" y2="10" />
              <line x1="6" y1="15" x2="10" y2="15" />
            </svg>
          </div>
          <h1 className="auth-brand-title">SubTrackr</h1>
          <p className="auth-brand-subtitle">Subscription Intelligence Platform</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;

