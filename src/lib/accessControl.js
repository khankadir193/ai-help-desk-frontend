/**
 * accessControl.js — single frontend source of truth for role-based access.
 *
 * The matrix below MIRRORS the backend's `authorize(...)` rules (the server
 * remains the source of truth and still returns 403 for every denied call —
 * this file only lets the UI avoid fetching pages the user cannot use).
 * Sources (do not edit without checking the routes files first):
 *   - backend/src/modules/team/team.routes.js        (team)
 *   - backend/src/modules/reports/reports.routes.js  (reports)
 *   - backend/src/modules/kb/kb.routes.js            (kb read / kb editor)
 *   - backend/src/modules/settings/settings.routes.js (settings view vs admin save)
 *   - backend/src/modules/dashboard/dashboard.routes.js (dashboard)
 *   - backend/src/modules/tickets/ticket.routes.js   (tickets / ai actions)
 *
 * A feature with `allowedRoles: null` is open to every authenticated role.
 */
export const FEATURES = {
  // GET /dashboard — authorize("CUSTOMER", "AGENT", "ADMIN")
  dashboard: { label: 'the dashboard', allowedRoles: ['CUSTOMER', 'AGENT', 'ADMIN'] },

  // GET /tickets, /tickets/:id — no authorize() call; scoped per role in the service
  tickets: { label: 'tickets', allowedRoles: null },

  // AI Assistant is internal agent/admin tooling; server returns 403 for CUSTOMER
  'ai-assistant': { label: 'the AI assistant', allowedRoles: ['AGENT', 'ADMIN'] },

  // GET /kb/* — no authorize() call; readable by every authenticated role
  'knowledge-base': { label: 'the knowledge base', allowedRoles: null },

  // POST/PATCH/DELETE /kb/articles|categories|publish|ai/suggest —
  // authorize("ADMIN", "AGENT")
  'kb-editor': { label: 'knowledge base editing', allowedRoles: ['AGENT', 'ADMIN'] },

  // GET /reports/analytics — authorize("AGENT", "ADMIN")
  reports: { label: 'reports & analytics', allowedRoles: ['AGENT', 'ADMIN'] },

  // GET /team/members|performance|roles|teams — authorize("AGENT", "ADMIN")
  team: { label: 'team management', allowedRoles: ['AGENT', 'ADMIN'] },

  // GET /team/invite-options, POST /team/invitations[...] — authorize("ADMIN")
  'team-invite': { label: 'member invitations', allowedRoles: ['ADMIN'] },

  // GET /settings/* — open to all authenticated roles. Admin-only mutations
  // (workspace/team/ai) are already disabled in the settings UI for other roles.
  settings: { label: 'workspace settings', allowedRoles: null },
};

/**
 * Whether `role` may use `feature`. Roles are normalized (uppercase) exactly
 * like the backend middleware does. A missing feature or an open feature
 * resolves to "allowed" so unknown/new pages never get accidentally locked.
 */
export function canAccess(role, feature) {
  const entry = FEATURES[feature];
  if (!entry || !entry.allowedRoles) return true;

  const normalized = String(role || '').toUpperCase();
  if (!normalized) return true; // defensive: never lock the whole UI while auth restores

  return entry.allowedRoles.includes(normalized);
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
