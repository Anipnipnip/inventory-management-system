import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Guards routes that require login. While the initial auth check is
// still running (isLoading), nothing is rendered yet -- otherwise a
// logged-in user would see a flash of the login page before the
// stored token finishes being verified.
export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
