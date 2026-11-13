import { useState } from 'react';
import SettingsCard from './SettingsCard';
import Modal from '../../../components/ui/Modal/Modal';
import './ActiveSessionCard.css';

export default function ActiveSessionCard({
  sessionData,
  onRevokeOthers,
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeSuccess, setRevokeSuccess] = useState(null);

  const current = sessionData?.current_session || {
    browser: 'Chrome on macOS',
    location: 'San Francisco, US',
  };

  const handleRevoke = async () => {
    setIsRevoking(true);
    try {
      await onRevokeOthers();
      setShowConfirmModal(false);
      setRevokeSuccess('Other sessions revoked.');
      setTimeout(() => setRevokeSuccess(null), 3000);
    } catch {
      // Handled in hook
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <>
      <SettingsCard title="Active session">
        <div className="active-session__info">
          <span className="active-session__browser">{current.browser || 'Chrome on macOS'}</span>
          <span className="active-session__location">
            {current.location || 'San Francisco, US'} · Current session
          </span>
          <span className="active-session__status">✓ Active now</span>
        </div>

        {revokeSuccess && (
          <span className="active-session__success">{revokeSuccess}</span>
        )}

        <button
          type="button"
          className="settings-btn-outline active-session__btn"
          onClick={() => setShowConfirmModal(true)}
        >
          Sign out other sessions
        </button>
      </SettingsCard>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Sign out other sessions?"
        description="This will sign out your account from all other devices and browsers. Your current session will remain active."
        size="sm"
        footer={
          <div className="active-session__modal-actions">
            <button
              type="button"
              className="settings-btn-outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={isRevoking}
            >
              Cancel
            </button>
            <button
              type="button"
              className="active-session__btn-confirm"
              onClick={handleRevoke}
              disabled={isRevoking}
            >
              {isRevoking ? 'Signing out...' : 'Sign out other sessions'}
            </button>
          </div>
        }
      >
        <p className="active-session__modal-desc">
          Are you sure you want to sign out other sessions? Anyone currently signed in on other devices will need to sign in again.
        </p>
      </Modal>
    </>
  );
}

