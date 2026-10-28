import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import Spinner from '../components/feedback/Spinner/Spinner';
import { ROUTES } from '../constants/routes';

/**
 * Route guard that ensures the user is authenticated.
 * Prevents protected views from rendering until session restoration resolves.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Spinner fullPage label="Restoring session..." />;
  }

  if (!isAuthenticated) {
    // Preserve intended URL so user is returned after successful login
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
}

