import Modal from '../../../../components/ui/Modal/Modal';
import { getRoleLabel } from '../../utils/teamPermissions';
import './InviteConfirmDialog.css';

export default function InviteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  email,
  role,
  team,
  isSubmitting,
  serverError,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title="Confirm invitation"
      description="Review the details before sending the workspace invitation."
      size="md"
    >
      <div className="invite-confirm-content">
        <div className="invite-confirm-summary">
          <div className="invite-confirm-row">
            <span className="invite-confirm-label">Work email</span>
            <span className="invite-confirm-val invite-confirm-val--email">{email}</span>
          </div>

          <div className="invite-confirm-row">
            <span className="invite-confirm-label">Assigned role</span>
            <span className="invite-confirm-val">{getRoleLabel(role)}</span>
          </div>

          <div className="invite-confirm-row">
            <span className="invite-confirm-label">Team assignment</span>
            <span className="invite-confirm-val">{team}</span>
          </div>

          <div className="invite-confirm-row">
            <span className="invite-confirm-label">Invitation expiry</span>
            <span className="invite-confirm-val">7 days from dispatch</span>
          </div>
        </div>

        {serverError && (
          <div className="invite-confirm-error" role="alert">
            {serverError}
          </div>
        )}

        <div className="invite-confirm-actions">
          <button
            type="button"
            className="invite-confirm-btn-back"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Back to edit
          </button>

          <button
            type="button"
            className="invite-confirm-btn-send"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="invite-btn-spinner-wrap">
                <span className="invite-btn-spinner" aria-hidden="true" />
                Sending invitation…
              </span>
            ) : (
              'Send invitation'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
