import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// "/" has no page of its own -- it just sends each role to its actual
// landing page (Phase 14 decision, Option A: admin -> Dashboard,
// staff -> Products).
export const HomeRedirect = () => {
  const { isAdmin } = useAuth();
  return <Navigate to={isAdmin ? '/dashboard' : '/products'} replace />;
};
