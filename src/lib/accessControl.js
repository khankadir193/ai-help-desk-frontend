/**
 * accessControl.js — single frontend source of truth for permission-based and role-based access.
 *
 * Checks access against the live permissions returned on the current user session (auth/me)
 * or falls back to static role rules when only a role string is provided.
 */
export const FEATURES = {
  // GET /dashboard
  dashboard: { label: 'the dashboard', allowedRoles: ['CUSTOMER', 'AGENT', 'ADMIN'] },

  // GET /tickets
  tickets: { label: 'tickets', allowedRoles: null },

  // AI Assistant
  'ai-assistant': { label: 'the AI assistant', allowedRoles: ['AGENT', 'ADMIN'] },

  // Knowledge Base viewing
  'knowledge-base': { label: 'the knowledge base', allowedRoles: null },

  // KB authoring/editing
  'kb-editor': { label: 'knowledge base editing', allowedRoles: ['AGENT', 'ADMIN'] },

  // Reports & Analytics
  reports: { label: 'reports & analytics', allowedRoles: ['AGENT', 'ADMIN'] },

  // Team section
  team: { label: 'team management', allowedRoles: ['AGENT', 'ADMIN'] },

  // Member invitations
  'team-invite': { label: 'member invitations', allowedRoles: ['ADMIN'] },

  // Workspace Settings
  settings: { label: 'workspace settings', allowedRoles: null },
};

/**
 * Extract role, permissions map, and scopes map from user object or role string.
 */
function extractUserMeta(userOrRole) {
  if (!userOrRole) return { role: '', permissions: null, scopes: null };
  if (typeof userOrRole === 'string') {
    return { role: userOrRole.toUpperCase(), permissions: null, scopes: null };
  }
  return {
    role: String(userOrRole.role || '').toUpperCase(),
    permissions: userOrRole.permissions || null,
    scopes: userOrRole.permission_scopes || null,
  };
}

/**
 * Check whether a user or role has a specific raw permission value.
 */
export function hasPermission(userOrRole, permissionId, expectedValue = 'Allowed') {
  const { role, permissions } = extractUserMeta(userOrRole);
  if (role === 'ADMIN') return true;
  if (!permissions) return false;
  const val = permissions[permissionId];
  if (expectedValue === 'Allowed') {
    return val === 'Allowed' || val === 'Publish & edit' || val === 'Workspace';
  }
  return val === expectedValue;
}

/**
 * Get permission scope ('ALL', 'ASSIGNED', 'OWN', 'NONE', 'FULL', 'DRAFT', 'WORKSPACE', 'EDIT', 'VIEW').
 */
export function getPermissionScope(userOrRole, permissionId) {
  const { role, scopes, permissions } = extractUserMeta(userOrRole);
  if (role === 'ADMIN') {
    if (permissionId === 'publish_kb') return 'FULL';
    if (permissionId === 'view_reports') return 'WORKSPACE';
    if (permissionId === 'edit_roles_permissions') return 'EDIT';
    return 'ALL';
  }
  if (scopes && scopes[permissionId]) return scopes[permissionId];
  const val = permissions?.[permissionId];
  if (!val || val === 'Not allowed') return 'NONE';
  if (val === 'All tickets') return 'ALL';
  if (val === 'Assigned tickets') return 'ASSIGNED';
  if (val === 'Own tickets') return 'OWN';
  if (val === 'Publish & edit') return 'FULL';
  if (val === 'Draft only') return 'DRAFT';
  if (val === 'Workspace') return 'WORKSPACE';
  if (val === 'Own performance') return 'OWN';
  if (val === 'Allowed') return 'EDIT';
  if (val === 'View only') return 'VIEW';
  return 'NONE';
}

/**
 * Convenience helper: whether user may create tickets.
 */
export function canCreateTickets(userOrRole) {
  const { role, permissions } = extractUserMeta(userOrRole);
  if (role === 'ADMIN') return true;
  if (permissions) {
    return permissions.create_tickets === 'Allowed';
  }
  return role === 'CUSTOMER';
}

/**
 * Whether `userOrRole` may use `feature`.
 * If a full user object with `permissions` is available, access is decided
 * by the effective permissions. Otherwise falls back to static role lists.
 */
export function canAccess(userOrRole, feature) {
  const { role, permissions, scopes } = extractUserMeta(userOrRole);
  if (!role) return true; // defensive while session restores
  if (role === 'ADMIN') return true;

  // Live matrix evaluation when user.permissions is present
  if (permissions) {
    switch (feature) {
      case 'dashboard':
      case 'tickets':
        return permissions.view_tickets !== 'Not allowed';

      case 'ticket-create':
        return permissions.create_tickets === 'Allowed';

      case 'ai-assistant':
        return permissions.ai_tools !== 'Not allowed' && scopes?.ai_tools !== 'NONE';

      case 'knowledge-base':
        return true;

      case 'kb-editor':
        return permissions.publish_kb === 'Publish & edit' || permissions.publish_kb === 'Draft only';

      case 'reports':
        return permissions.view_reports !== 'Not allowed' && scopes?.view_reports !== 'NONE';

      case 'team': {
        const canInvite = permissions.invite_members === 'Allowed';
        const canViewRoles = permissions.edit_roles_permissions !== 'Not allowed';
        const canViewPerf = permissions.view_reports !== 'Not allowed';
        return canInvite || canViewRoles || canViewPerf;
      }

      case 'team-invite':
        return permissions.invite_members === 'Allowed';

      case 'settings':
        return true;

      default:
        break;
    }
  }

  // Fallback to static role configuration
  const entry = FEATURES[feature];
  if (!entry || !entry.allowedRoles) return true;
  return entry.allowedRoles.includes(role);
}

/**
 * Human-readable role label ("Support Agent", "Admin", ...).
 */
export function getRoleLabel(role) {
  switch (String(role || '').toUpperCase()) {
    case 'ADMIN':
      return 'Admin';
    case 'AGENT':
      return 'Support Agent';
    case 'CUSTOMER':
      return 'Customer';
    default:
      return role ? String(role) : '';
  }
}

/**
 * Human-readable feature label for AccessDenied copy.
 */
export function getFeatureLabel(feature) {
  return FEATURES[feature]?.label || 'this page';
}

/**
 * The safest "home" route for a role: the Dashboard when the backend allows
 * it, otherwise the ticket list (open to every authenticated role).
 */
export function getHomeRoute(role) {
  return canAccess(role, 'dashboard') ? '/' : '/tickets';
}
