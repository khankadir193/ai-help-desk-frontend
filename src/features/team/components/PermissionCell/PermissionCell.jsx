import { parsePermissionValue } from '../../utils/teamPermissions';
import './PermissionCell.css';

const SCOPE_OPTIONS_MAP = {
  view_reply_tickets: ['All tickets', 'Team tickets', 'Assigned tickets'],
  assign_reassign_tickets: ['All teams', 'Own team', 'Self only'],
  view_reports: ['Workspace', 'Own team', 'Own performance'],
  invite_members: ['Any role', 'Support Agent only', 'Not allowed'],
  publish_kb: ['Allowed', 'Draft only', 'Not allowed'],
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
    // If it's a binary Allowed / Not allowed permission
    const isBinary = type === 'allowed' || type === 'not-allowed';
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

    if (isBinary) {
      return (
        <div className="perm-cell perm-cell--edit">
          <select
            className={`perm-cell__select ${value === 'Allowed' ? 'perm-cell__select--allowed' : ''}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${permId} for ${roleId}`}
          >
            <option value="Allowed">✓ Allowed</option>
            <option value="Not allowed">— Not allowed</option>
          </select>
        </div>
      );
    }
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
