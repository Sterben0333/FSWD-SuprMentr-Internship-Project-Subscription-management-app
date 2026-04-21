import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';

// Placeholder for pages built in later phases
const PlaceholderPage = ({ title, icon }) => (
  <div className="animate-fade-in-up">
    <div className="flex items-center gap-md" style={{ marginBottom: 'var(--space-lg)' }}>
      <span style={{ fontSize: '32px' }}>{icon}</span>
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
    <div className="glass-card" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
      <p className="text-secondary text-lg">🚧 Coming soon — this page will be built in an upcoming phase.</p>
    </div>
  </div>
);

const DashboardPage = () => <PlaceholderPage title="Dashboard" icon="📊" />;
const SubscriptionsPage = () => <PlaceholderPage title="Subscriptions" icon="💳" />;
const AnalyticsPage = () => <PlaceholderPage title="Analytics" icon="📈" />;
const SettingsPage = () => <PlaceholderPage title="Settings" icon="⚙️" />;

const router = createBrowserRouter([
  {
    // Public routes (auth)
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    // Protected routes (dashboard)
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/subscriptions', element: <SubscriptionsPage /> },
      { path: '/analytics', element: <AnalyticsPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
  {
    // Catch-all redirect
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

export default router;
