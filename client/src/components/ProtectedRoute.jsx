import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useMaintenanceStore from '../store/maintenanceStore';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const { isMaintenanceMode, checkMaintenanceStatus } = useMaintenanceStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkMaintenanceStatus().then(() => setChecked(true));
  }, [checkMaintenanceStatus]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wait for the maintenance check before rendering
  if (!checked) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  // Non-admin users get redirected during maintenance
  if (isMaintenanceMode && !isAdmin) {
    return <Navigate to="/maintenance" replace />;
  }

  return children;
};

export default ProtectedRoute;

