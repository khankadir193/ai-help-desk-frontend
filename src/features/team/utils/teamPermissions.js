/**
 * Role and permission utilities for Team feature.
 */

/**
 * Check if the user role can invite new workspace members.
 * Admins and Managers can invite; Support Agents and Customers cannot.
 */
export function canInvite(role) {
  const normalized = String(role || '').toUpperCase();
  return normalized === 'ADMIN' || normalized === 'MANAGER';
}

/**
 * Check if the user role can edit permissions.
 * Only Admins can edit permissions.
 */
export function canEditRoles(role) {
  const normalized = String(role || '').toUpperCase();
  return normalized === 'ADMIN';
}

/**
 * Human-readable role label.
 */
export function getRoleLabel(role) {
  switch (String(role || '').toUpperCase()) {
    case 'ADMIN':
      return 'Admin';
    case 'MANAGER':
      return 'Manager';
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
