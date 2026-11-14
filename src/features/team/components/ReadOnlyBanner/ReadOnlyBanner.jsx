import { getRoleLabel } from '../../utils/teamPermissions';
import './ReadOnlyBanner.css';

export default function ReadOnlyBanner({
  canEdit,
  currentUserRole,
  adminContact,
  onRequestAccess,
}) {
  const roleName = getRoleLabel(currentUserRole);

  if (canEdit) {
    return (
      <div className="team-banner team-banner--admin" role="status">
        <span className="team-banner__text">
          You can edit permissions. Changes require confirmation before they apply.
        </span>
      </div>
    );
  }

  return (
    <div className="team-banner team-banner--readonly" role="status">
      <span className="team-banner__text">
        Read-only · You're signed in as {roleName === 'Admin' ? 'an Admin' : `a ${roleName}`}. Only Admins can change workspace permissions.
      </span>

      {adminContact?.email ? (
        <a
          href={`mailto:${adminContact.email}?subject=HelpDesk%20Workspace%20Permission%20Inquiry`}
          className="team-banner__contact-link"
          onClick={(e) => {
            if (onRequestAccess) {
              e.preventDefault();
              onRequestAccess();
            }
          }}
        >
          Contact {adminContact.name || 'Admin'}
        </a>
      ) : (
        <button
          type="button"
          className="team-banner__contact-btn"
          onClick={onRequestAccess}
        >
          Contact {adminContact?.name || 'Admin'}
        </button>
      )}
    </div>
  );
}
