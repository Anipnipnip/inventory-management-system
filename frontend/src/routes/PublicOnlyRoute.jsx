import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Opposite of ProtectedRoute: for pages that only make sense when
// logged out (login, register). A logged-in user hitting /login
// directly gets sent to the dashboard instead of seeing the form again.
export const PublicOnlyRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};
