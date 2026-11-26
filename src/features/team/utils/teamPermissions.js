/**
 * Role and permission utilities for Team feature.
 */

/**
 * Check if the user or role can invite new workspace members.
 * Reads live permissions from user object if available.
 */
export function canInvite(userOrRole) {
  if (!userOrRole) return false;
  if (typeof userOrRole === 'string') {
    return userOrRole.toUpperCase() === 'ADMIN';
  }
  const role = String(userOrRole.role || '').toUpperCase();
  if (role === 'ADMIN') return true;
  return userOrRole.permissions?.invite_members === 'Allowed';
}

/**
 * Check if the user or role can edit permissions matrix.
 * Reads live permissions from user object if available.
 */
export function canEditRoles(userOrRole) {
  if (!userOrRole) return false;
  if (typeof userOrRole === 'string') {
    return userOrRole.toUpperCase() === 'ADMIN';
  }
  const role = String(userOrRole.role || '').toUpperCase();
  if (role === 'ADMIN') return true;
  return (
    userOrRole.permissions?.edit_roles_permissions === 'Allowed' ||
    userOrRole.permission_scopes?.edit_roles_permissions === 'EDIT'
  );
}

/**
 * Human-readable role label.
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
      return role || 'Member';
  }
}

/**
 * Map permission value to display style/representation.
 */
export function parsePermissionValue(value) {
  if (value === 'Allowed' || value === true || value === '✓ Allowed') {
    return { type: 'allowed', label: '✓ Allowed' };
  }
  if (value === 'Not allowed' || value === false || value === '— Not allowed') {
    return { type: 'not-allowed', label: '— Not allowed' };
  }
  return { type: 'text', label: String(value) };
}
