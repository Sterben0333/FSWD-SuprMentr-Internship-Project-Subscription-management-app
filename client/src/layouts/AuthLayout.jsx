import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-bg-effects">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-orb auth-orb-3"></div>
      </div>
      <div className="auth-container animate-fade-in-up">
        <div className="auth-brand">
          <span className="auth-logo">💳</span>
          <h1 className="gradient-text">SubTrackr</h1>
          <p className="text-secondary">Subscription Intelligence Platform</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
