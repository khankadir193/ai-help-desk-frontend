import { Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { canAccess, getFeatureLabel } from '../../lib/accessControl';
import AccessDenied from '../AccessDenied/AccessDenied';

/**
 * RoleGuard — route-level permission gate.
 *
 * Renders its children (or an <Outlet /> when used as a layout route) only
 * when the signed-in role may access `feature` according to the shared
 * access-control matrix (src/lib/accessControl.js), which mirrors the
 * backend's authorize() rules. A denied user sees the shared AccessDenied
 * screen immediately — no data fetch, no loader flash.
 *
 * Usage:
 *   <Route index element={<RoleGuard feature="team"><TeamMembersPage /></RoleGuard>} />
 *   — or as a layout route —
 *   <Route element={<RoleGuard feature="reports" />}> ... </Route>
 *
 * Note: this is a convenience gate only. The backend still enforces every
 * permission and keeps returning 403.
 */
export default function RoleGuard({ feature, children }) {
  const { role, user } = useAuth();

  if (canAccess(user || role, feature)) {
    return children ?? <Outlet />;
  }

  return (
    <AccessDenied
      featureName={getFeatureLabel(feature)}
      role={role}
    />
  );
}
