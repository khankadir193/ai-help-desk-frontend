import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import Spinner from '../components/feedback/Spinner/Spinner';
import { ROUTES } from '../constants/routes';

/**
 * Route guard that ensures the user is authenticated.
 * Prevents protected views from rendering until session restoration resolves.
 * Supports both children and nested Route Outlet, with optional role restriction.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.children]
 * @param {Array<string>} [props.allowedRoles]
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Spinner fullPage label="Restoring session..." />;
  }

  if (!isAuthenticated) {
    // Preserve intended URL so user is returned after successful login
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  const effectiveRole = role || user?.role;
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(effectiveRole)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children || <Outlet />;
}

