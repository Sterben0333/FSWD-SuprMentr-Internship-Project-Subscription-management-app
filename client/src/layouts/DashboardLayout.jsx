import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import './DashboardLayout.css';

const navItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/subscriptions', icon: '💳', label: 'Subscriptions' },
  { path: '/analytics', icon: '📈', label: 'Analytics' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
];

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`dashboard-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">💳</span>
          {!sidebarCollapsed && <span className="sidebar-title gradient-text">SubTrackr</span>}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-toggle btn-ghost"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Navbar */}
        <header className="navbar">
          <div className="navbar-left">
            <h2 className="page-title">Dashboard</h2>
          </div>

          <div className="navbar-right">
            {/* Theme Toggle */}
            <button
              className="theme-toggle btn-icon"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Notification Bell (placeholder for Phase 6) */}
            <button className="notification-bell btn-icon" title="Notifications">
              🔔
            </button>

            {/* User Menu */}
            <div className="user-menu">
              <div className="user-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {!sidebarCollapsed && (
                <div className="user-info">
                  <span className="user-name">{user?.name || 'User'}</span>
                  <span className="user-email">{user?.email || ''}</span>
                </div>
              )}
              <button className="btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
