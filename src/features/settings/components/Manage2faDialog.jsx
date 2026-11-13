import { useState } from 'react';
import Modal from '../../../components/ui/Modal/Modal';
import Toggle from './Toggle';
import './Manage2faDialog.css';

export default function Manage2faDialog({
  isOpen,
  onClose,
  isEnabled = true,
  onToggle2fa,
}) {
  const [enabled, setEnabled] = useState(isEnabled);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleSave = async () => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await onToggle2fa({ enabled });
      onClose();
    } catch (err) {
      setServerError(err?.response?.data?.message || err?.message || 'Failed to update 2FA status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Two-factor authentication"
      description="Add an extra layer of security to your account with an authenticator app."
      size="md"
      footer={
        <div className="manage-2fa__actions">
          <button
            type="button"
            className="manage-2fa__btn-cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="manage-2fa__btn-submit"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save preferences'}
          </button>
        </div>
      }
    >
      <div className="manage-2fa__content">
        {serverError && (
          <div className="manage-2fa__error">{serverError}</div>
        )}

        <div className="manage-2fa__row">
          <div className="manage-2fa__info">
            <span className="manage-2fa__label">Authenticator app</span>
            <span className="manage-2fa__subtext">
              Use Google Authenticator, 1Password, or Authy to generate verification codes.
            </span>
          </div>
          <Toggle
            checked={enabled}
            onChange={setEnabled}
            ariaLabel="Toggle two-factor authentication"
          />
        </div>

        {enabled && (
          <div className="manage-2fa__box">
            <span className="manage-2fa__badge">✓ Authenticator configured</span>
            <p className="manage-2fa__box-desc">
              Verification codes are active. You will be prompted for a 6-digit code when signing in from an untrusted browser.
            </p>
          </div>
        )}

        {!enabled && (
          <div className="manage-2fa__warning">
            Turning off two-factor authentication leaves your account protected by only your password.
          </div>
        )}
      </div>
    </Modal>
  );
}

