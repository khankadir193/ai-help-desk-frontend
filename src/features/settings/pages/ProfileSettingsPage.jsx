import { useState, useMemo, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import SettingsCard from '../components/SettingsCard';
import FormField from '../components/FormField';
import InfoCallout from '../components/InfoCallout';
import ProfilePhotoRow from '../components/ProfilePhotoRow';
import YourAccountCard from '../components/YourAccountCard';
import ActiveSessionCard from '../components/ActiveSessionCard';
import ChangePasswordDialog from '../components/ChangePasswordDialog';
import Manage2faDialog from '../components/Manage2faDialog';
import useProfileSettings from '../hooks/useProfileSettings';
import useSettingsForm from '../hooks/useSettingsForm';
import { useAuth } from '../../auth/hooks/useAuth';
import { formatSettingsDate } from '../utils/settingsFormatters';
import { validateRequired, validateEmail } from '../utils/settingsValidators';
import './ProfileSettingsPage.css';

export default function ProfileSettingsPage() {
  const { setSaveBarProps } = useOutletContext();
  const { user } = useAuth();

  const {
    profile,
    sessionsData,
    isLoading,
    isError,
    error,
    refetchProfile,
    updateProfile,
    uploadAvatar,
    changePassword,
    update2fa,
    revokeOtherSessions,
    isUpdatingAvatar,
  } = useProfileSettings();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [is2faModalOpen, setIs2faModalOpen] = useState(false);

  const initialValues = useMemo(
    () => ({
      name: profile?.name || user?.name || '',
      job_title: profile?.job_title || 'Customer Support Manager',
      email: profile?.email || user?.email || '',
    }),
    [profile, user]
  );

  const customValidate = useCallback((vals) => {
    const errs = {};
    const nameErr = validateRequired(vals.name, 'Full name');
    if (nameErr) errs.name = nameErr;

    const emailErr = validateEmail(vals.email);
    if (emailErr) errs.email = emailErr;

    return errs;
  }, []);

  const handleSave = useCallback(
    async (changedFields) => {
      const updated = await updateProfile(changedFields);
      return {
        name: updated.name,
        job_title: updated.job_title,
        email: updated.email,
      };
    },
    [updateProfile]
  );

  const form = useSettingsForm({
    initialValues,
    onSave: handleSave,
    validate: customValidate,
  });

  // Sync save bar with layout
  useEffect(() => {
    setSaveBarProps({
      isDirty: form.isDirty,
      isSaving: form.isSaving,
      isSuccess: form.isSuccess,
      saveError: form.saveError,
      onSave: form.handleSubmit,
      onCancel: form.handleCancel,
    });
  }, [
    setSaveBarProps,
    form.isDirty,
    form.isSaving,
    form.isSuccess,
    form.saveError,
    form.handleSubmit,
    form.handleCancel,
  ]);

  if (isLoading) {
    return (
      <div className="settings-grid">
        <div className="settings-grid__left">
          <div className="settings-card settings-card-skeleton settings-skeleton" />
          <div className="settings-card settings-card-skeleton settings-skeleton" />
        </div>
        <div className="settings-grid__right">
          <div className="settings-card settings-card-skeleton settings-skeleton" />
          <div className="settings-card settings-card-skeleton settings-skeleton" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="settings-error-banner">
        <p className="settings-error-banner__text">
          Failed to load profile settings: {error?.message || 'Server error'}
        </p>
        <button
          type="button"
          className="settings-error-banner__retry"
          onClick={() => refetchProfile()}
        >
          Retry
        </button>
      </div>
    );
  }

  const initials = profile?.initials || user?.initials || 'MC';
  const avatarUrl = profile?.avatar_url || user?.avatar_url;

  return (
    <div className="settings-grid">
      {/* Left Column */}
      <div className="settings-grid__left">
        {/* Personal Information Card */}
        <SettingsCard title="Personal information">
          <ProfilePhotoRow
            avatarUrl={avatarUrl}
            initials={initials}
            onUpload={uploadAvatar}
            isUploading={isUpdatingAvatar}
          />

          <div className="settings-divider" />

          <div className="settings-row-2col">
            <FormField
              id="full-name"
              label="Full name"
              value={form.values.name}
              onChange={(v) => form.handleChange('name', v)}
              onBlur={() => form.handleBlur('name')}
              placeholder="Maya Chen"
              error={form.errors.name}
              disabled={form.isSaving}
              required
            />

            <FormField
              id="job-title"
              label="Job title"
              value={form.values.job_title}
              onChange={(v) => form.handleChange('job_title', v)}
              onBlur={() => form.handleBlur('job_title')}
              placeholder="Customer Support Manager"
              error={form.errors.job_title}
              disabled={form.isSaving}
            />
          </div>

          <FormField
            id="profile-email"
            label="Email address"
            type="email"
            value={form.values.email}
            onChange={(v) => form.handleChange('email', v)}
            onBlur={() => form.handleBlur('email')}
            placeholder="maya.chen@acme.com"
            helperText={
              <span className="profile-settings__verified-note">
                <span className="profile-settings__check">✓</span> Verified · Used for
                sign-in and account notifications.
              </span>
            }
            error={form.errors.email}
            disabled={form.isSaving}
            required
          />
        </SettingsCard>

        {/* Account Security Card */}
        <SettingsCard title="Account security">
          {/* Password Row */}
          <div className="profile-settings__sec-row">
            <div className="profile-settings__sec-info">
              <span className="profile-settings__sec-label">Password</span>
              <span className="profile-settings__sec-subtext">
                Last changed {formatSettingsDate(profile?.password_last_changed)}
              </span>
            </div>
            <button
              type="button"
              className="settings-btn-outline"
              onClick={() => setIsPasswordModalOpen(true)}
            >
              Change password
            </button>
          </div>

          <div className="settings-divider" />

          {/* Two-Factor Authentication Row */}
          <div className="profile-settings__sec-row">
            <div className="profile-settings__sec-info">
              <span className="profile-settings__sec-label">Two-factor authentication</span>
              <span className="profile-settings__sec-status">
                {profile?.two_factor_enabled ? (
                  <span className="profile-settings__2fa-active">
                    ✓ Enabled · Authenticator app
                  </span>
                ) : (
                  <span className="profile-settings__2fa-inactive">
                    Disabled
                  </span>
                )}
              </span>
            </div>
            <button
              type="button"
              className="settings-btn-outline"
              onClick={() => setIs2faModalOpen(true)}
            >
              Manage 2FA
            </button>
          </div>
        </SettingsCard>
      </div>

      {/* Right Column */}
      <div className="settings-grid__right">
        <YourAccountCard user={user} profile={profile} />

        <ActiveSessionCard
          sessionData={sessionsData}
          onRevokeOthers={revokeOtherSessions}
        />

        <InfoCallout title="Security changes are separate">
          <p>
            Password and two-factor updates take effect immediately. Save your
            profile changes below.
          </p>
        </InfoCallout>
      </div>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onChangePassword={changePassword}
      />

      {/* Manage 2FA Dialog */}
      <Manage2faDialog
        isOpen={is2faModalOpen}
        onClose={() => setIs2faModalOpen(false)}
        isEnabled={profile?.two_factor_enabled}
        onToggle2fa={update2fa}
      />
    </div>
  );
}

