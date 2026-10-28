import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import Spinner from '../components/feedback/Spinner/Spinner';
import UnauthorizedPage from '../components/feedback/UnauthorizedPage/UnauthorizedPage';
import { ROUTES } from '../constants/routes';

/**
 * Route guard that validates user role permissions.
 * IMPORTANT: Client-side role checks are strictly for UX routing and never replace
 * backend authorization enforcement.
 *
 * @param {Object} props
 * @param {Array<string>} props.allowedRoles - e.g. [ROLES.ADMIN, ROLES.AGENT]
 */
export default function RoleRoute({ allowedRoles = [] }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Spinner fullPage label="Verifying authorization..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <UnauthorizedPage />;
  }

  return <Outlet />;
}

