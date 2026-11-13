import { useState } from 'react';
import Modal from '../../../components/ui/Modal/Modal';
import FormField from './FormField';
import { validatePassword } from '../utils/settingsValidators';
import './ChangePasswordDialog.css';

export default function ChangePasswordDialog({
  isOpen,
  onClose,
  onChangePassword,
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setServerError(null);
    setSuccessMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!currentPassword) {
      errs.current = 'Current password is required.';
    }

    const newPassErr = validatePassword(newPassword);
    if (newPassErr) {
      errs.new = newPassErr;
    }

    if (newPassword !== confirmPassword) {
      errs.confirm = 'New password and confirmation do not match.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      await onChangePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setSuccessMessage('Password changed successfully.');
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      setServerError(
        err?.response?.data?.message ||
          err?.userMessage ||
          'Failed to change password. Please check your current password.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change password"
      description="Update your password to keep your account secure."
      size="md"
      footer={
        <div className="change-pass__actions">
          <button
            type="button"
            className="change-pass__btn-cancel"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="change-pass__btn-submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update password'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="change-pass__form">
        {serverError && (
          <div className="change-pass__alert change-pass__alert--error">
            {serverError}
          </div>
        )}
        {successMessage && (
          <div className="change-pass__alert change-pass__alert--success">
            {successMessage}
          </div>
        )}

        <FormField
          id="current-password"
          label="Current password"
          type="password"
          value={currentPassword}
          onChange={(v) => {
            setCurrentPassword(v);
            setErrors((prev) => ({ ...prev, current: null }));
          }}
          error={errors.current}
          autoComplete="current-password"
          required
        />

        <FormField
          id="new-password"
          label="New password"
          type="password"
          value={newPassword}
          onChange={(v) => {
            setNewPassword(v);
            setErrors((prev) => ({ ...prev, new: null }));
          }}
          helperText="Must be at least 8 characters."
          error={errors.new}
          autoComplete="new-password"
          required
        />

        <FormField
          id="confirm-password"
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(v) => {
            setConfirmPassword(v);
            setErrors((prev) => ({ ...prev, confirm: null }));
          }}
          error={errors.confirm}
          autoComplete="new-password"
          required
        />
      </form>
    </Modal>
  );
}

