import { useState } from 'react';
import Modal from '../../../../components/ui/Modal/Modal';
import './RequestAccessDialog.css';

export default function RequestAccessDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  const [reason, setReason] = useState('');
  const [requestedRole, setRequestedRole] = useState('ADMIN');
  const [error, setError] = useState(null);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError('Please provide at least 5 characters explaining your access request.');
      return;
    }

    try {
      setError(null);
      await onSubmit(reason.trim(), requestedRole);
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        setReason('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit request.');
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setError(null);
    setIsSent(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Request access change"
      description="Describe why you need elevated access. Workspace Admins will review your request."
      size="md"
    >
      {isSent ? (
        <div className="request-dialog-success" role="status">
          <span className="request-dialog-success__icon" aria-hidden="true">✓</span>
          <h3 className="request-dialog-success__title">Request sent</h3>
          <p className="request-dialog-success__desc">
            Your request has been forwarded to the workspace administrators.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="request-dialog-form">
          <div className="request-dialog-field">
            <label htmlFor="requested-role" className="request-dialog-label">
              Requested access level
            </label>
            <select
              id="requested-role"
              className="request-dialog-select"
              value={requestedRole}
              onChange={(e) => setRequestedRole(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="ADMIN">Admin (Full workspace access)</option>
              <option value="MANAGER">Manager (Team management & reports)</option>
            </select>
          </div>

          <div className="request-dialog-field">
            <label htmlFor="request-reason" className="request-dialog-label">
              Reason for request *
            </label>
            <textarea
              id="request-reason"
              rows={4}
              className={`request-dialog-textarea ${error ? 'request-dialog-textarea--error' : ''}`}
              placeholder="Explain what workspace settings or permissions you need to manage..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSubmitting}
              required
            />
            {error && <span className="request-dialog-error">{error}</span>}
          </div>

          <div className="request-dialog-actions">
            <button
              type="button"
              className="request-dialog-btn-cancel"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="request-dialog-btn-submit"
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? 'Sending request…' : 'Send request'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
