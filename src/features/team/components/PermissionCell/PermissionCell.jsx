import { parsePermissionValue } from '../../utils/teamPermissions';
import './PermissionCell.css';

/**
 * Editable value options per permission id. Mirrors the backend's
 * PERMISSION_OPTIONS (utils/permissions.js) — the PATCH endpoint rejects
 * values outside this vocabulary with 422, so the two must stay in sync.
 */
const SCOPE_OPTIONS_MAP = {
  view_tickets: ['All tickets', 'Assigned tickets', 'Own tickets'],
  reply_tickets: ['All tickets', 'Assigned tickets', 'Own tickets'],
  update_status: ['All tickets', 'Assigned tickets', 'Own tickets', 'Not allowed'],
  ticket_history: ['All tickets', 'Assigned tickets', 'Own tickets', 'Not allowed'],
  ai_tools: ['All tickets', 'Assigned tickets', 'Own tickets', 'Not allowed'],
  publish_kb: ['Publish & edit', 'Draft only', 'View only', 'Not allowed'],
  view_reports: ['Workspace', 'Own performance', 'Not allowed'],
  edit_roles_permissions: ['Allowed', 'View only', 'Not allowed'],
};

export default function PermissionCell({
  permId,
  roleId,
  value,
  canEdit = false,
  onChange,
}) {
  const { type, label } = parsePermissionValue(value);

  // If Admin edit mode is active, allow changing cell
  if (canEdit && onChange) {
    const scopeOptions = SCOPE_OPTIONS_MAP[permId];

    if (scopeOptions) {
      return (
        <div className="perm-cell perm-cell--edit">
          <select
            className="perm-cell__select"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${permId} for ${roleId}`}
          >
            {scopeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // Binary Allowed / Not allowed permission
    return (
      <div className="perm-cell perm-cell--edit">
        <select
          className={`perm-cell__select ${value === 'Allowed' ? 'perm-cell__select--allowed' : ''}`}
          value={value === 'Allowed' ? 'Allowed' : 'Not allowed'}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${permId} for ${roleId}`}
        >
          <option value="Allowed">✓ Allowed</option>
          <option value="Not allowed">— Not allowed</option>
        </select>
      </div>
    );
  }

  // Read-only display matching reference design
  return (
    <div className={`perm-cell perm-cell--${type}`}>
      {type === 'allowed' && (
        <span className="perm-cell__badge perm-cell__badge--allowed">
          ✓ Allowed
        </span>
      )}
      {type === 'not-allowed' && (
        <span className="perm-cell__badge perm-cell__badge--not-allowed">
          — Not allowed
        </span>
      )}
      {type === 'text' && (
        <span className="perm-cell__text">
          {label}
        </span>
      )}
    </div>
  );
}
