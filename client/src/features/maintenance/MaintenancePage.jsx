import { useState, useEffect } from 'react';
import useMaintenanceStore from '../../store/maintenanceStore';
import useThemeStore from '../../store/themeStore';
import './MaintenancePage.css';

const MaintenancePage = () => {
  const { message, checkMaintenanceStatus } = useMaintenanceStore();
  const initTheme = useThemeStore((state) => state.initTheme);
  const [checking, setChecking] = useState(false);

  // Ensure the theme is applied on this standalone page
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const handleRetry = async () => {
    setChecking(true);
    try {
      const status = await checkMaintenanceStatus();
      if (!status.isEnabled) {
        // Maintenance is over — redirect to the app
        window.location.href = '/login';
      }
    } finally {
      setChecking(false);
    }
  };

  const displayMessage =
    message ||
    "We're currently performing some maintenance to improve your experience. We'll be back shortly!";

  return (
    <div className="maintenance-page" id="maintenance-page">
      {/* Animated background orbs */}
      <div className="maintenance-bg-orb maintenance-bg-orb--1" />
      <div className="maintenance-bg-orb maintenance-bg-orb--2" />
      <div className="maintenance-bg-orb maintenance-bg-orb--3" />

      <div className="maintenance-card">
        {/* Animated illustration — gears + wrench */}
        <div className="maintenance-illustration">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Large gear */}
            <g className="maintenance-gear-large">
              <circle cx="60" cy="60" r="22" stroke="var(--primary)" strokeWidth="3" fill="none" />
              <circle cx="60" cy="60" r="10" stroke="var(--primary)" strokeWidth="2" fill="var(--primary-light)" />
              {/* Gear teeth */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                const rad = (angle * Math.PI) / 180;
                const x1 = 60 + 22 * Math.cos(rad);
                const y1 = 60 + 22 * Math.sin(rad);
                const x2 = 60 + 28 * Math.cos(rad);
                const y2 = 60 + 28 * Math.sin(rad);
                return (
                  <line
                    key={angle}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="var(--primary)"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>

            {/* Small gear */}
            <g className="maintenance-gear-small">
              <circle cx="95" cy="95" r="14" stroke="var(--accent)" strokeWidth="2.5" fill="none" />
              <circle cx="95" cy="95" r="6" stroke="var(--accent)" strokeWidth="1.5" fill="var(--accent-light)" />
              {[0, 60, 120, 180, 240, 300].map((angle) => {
                const rad = (angle * Math.PI) / 180;
                const x1 = 95 + 14 * Math.cos(rad);
                const y1 = 95 + 14 * Math.sin(rad);
                const x2 = 95 + 19 * Math.cos(rad);
                const y2 = 95 + 19 * Math.sin(rad);
                return (
                  <line
                    key={angle}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="var(--accent)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>

            {/* Wrench */}
            <g className="maintenance-wrench" opacity="0.7">
              <path
                d="M25 95 L50 70 Q55 65 60 70 L50 80 Q48 82 50 84 L60 74 Q62 72 64 74 L34 104 Q30 108 26 104 L25 95Z"
                fill="var(--text-muted)"
                stroke="var(--text-secondary)"
                strokeWidth="1"
              />
            </g>
          </svg>
        </div>

        <h1 className="maintenance-title">
          Under <span className="gradient-text">Maintenance</span>
        </h1>

        <p className="maintenance-subtitle">We'll be back soon</p>

        <div className="maintenance-divider" />

        <p className="maintenance-message">{displayMessage}</p>

        <button
          className="maintenance-retry-btn"
          onClick={handleRetry}
          disabled={checking}
          id="maintenance-retry-btn"
        >
          {checking ? (
            <>
              <span className="spinner spinner-sm" />
              Checking...
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 16, height: 16 }}
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Try Again
            </>
          )}
        </button>

        <div className="maintenance-footer">
          <span className="maintenance-status-dot" />
          <span>Scheduled maintenance in progress</span>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
