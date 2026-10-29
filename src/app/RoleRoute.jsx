import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import Spinner from '../components/feedback/Spinner/Spinner';
import { ROUTES } from '../constants/routes';

/**
 * Route guard that validates user role permissions.
 * IMPORTANT: Client-side role checks are strictly for UX routing and never replace
 * backend authorization enforcement.
 *
 * @param {Object} props
 * @param {Array<string>} props.allowedRoles - e.g. [ROLES.ADMIN, ROLES.AGENT]
 * @param {React.ReactNode} [props.children] - optional children
 */
export default function RoleRoute({ allowedRoles = [], children }) {
  const { user, isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Spinner fullPage label="Verifying authorization..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  const effectiveRole = role || user?.role;
  if (allowedRoles.length > 0 && !allowedRoles.includes(effectiveRole)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children || <Outlet />;
}

