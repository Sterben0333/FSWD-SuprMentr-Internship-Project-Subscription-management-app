import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages (will be created in later phases)
// For now, use placeholder components
const PlaceholderPage = ({ title }) => (
  <div className="animate-fade-in-up" style={{ padding: 'var(--space-xl)' }}>
    <h1 className="text-2xl font-bold" style={{ marginBottom: 'var(--space-md)' }}>{title}</h1>
    <p className="text-secondary">This page will be built in an upcoming phase.</p>
  </div>
);

const LoginPage = () => <PlaceholderPage title="Login" />;
const RegisterPage = () => <PlaceholderPage title="Register" />;
const DashboardPage = () => <PlaceholderPage title="Dashboard" />;
const SubscriptionsPage = () => <PlaceholderPage title="Subscriptions" />;
const AnalyticsPage = () => <PlaceholderPage title="Analytics" />;
const SettingsPage = () => <PlaceholderPage title="Settings" />;

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
