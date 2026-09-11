import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Guards pages that only make sense for admins (Dashboard, and later
// Reports) -- matches the admin-only routes already enforced on the
// backend (see dashboardRoutes.js). A staff account that reaches this
// route, e.g. by typing the URL directly, is sent to its own landing
// page instead of a broken page full of 403 errors.
export const AdminRoute = () => {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) return null;

  return isAdmin ? <Outlet /> : <Navigate to="/products" replace />;
};
