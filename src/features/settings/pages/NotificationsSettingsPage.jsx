import { useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import SettingsCard from '../components/SettingsCard';
import InfoCallout from '../components/InfoCallout';
import NotificationMatrix from '../components/NotificationMatrix';
import ChannelsCard from '../components/ChannelsCard';
import DigestQuietHoursCard from '../components/DigestQuietHoursCard';
import useNotificationSettings from '../hooks/useNotificationSettings';
import useSettingsForm from '../hooks/useSettingsForm';
import { useAuth } from '../../auth/hooks/useAuth';
import { DEFAULT_NOTIFICATION_EVENTS } from '../utils/settingsConstants';
import './NotificationsSettingsPage.css';

export default function NotificationsSettingsPage() {
  const { setSaveBarProps } = useOutletContext();
  const { user } = useAuth();

  const {
    notifications,
    isLoading,
    isError,
    error,
    refetch,
    updateNotifications,
  } = useNotificationSettings();

  const initialValues = useMemo(
    () => ({
      channels: {
        in_app: notifications?.channels?.in_app ?? true,
        email: notifications?.channels?.email ?? true,
        desktop: notifications?.channels?.desktop ?? false,
      },
      email_digest: notifications?.email_digest || 'DAILY_8AM',
      quiet_hours: {
        enabled: notifications?.quiet_hours?.enabled ?? true,
        start: notifications?.quiet_hours?.start || '18:00',
        end: notifications?.quiet_hours?.end || '08:00',
      },
      matrix: notifications?.matrix || DEFAULT_NOTIFICATION_EVENTS,
    }),
    [notifications]
  );

  const handleSave = useCallback(
    async (changedFields) => {
      const updated = await updateNotifications(changedFields);
      return {
        channels: updated.channels,
        email_digest: updated.email_digest,
        quiet_hours: updated.quiet_hours,
        matrix: updated.matrix,
      };
    },
    [updateNotifications]
  );

  const form = useSettingsForm({
    initialValues,
    onSave: handleSave,
  });

  // Handlers for matrix and channels
  const handleMatrixRowChange = useCallback(
    (rowId, channelKey, checked) => {
      form.setValues((prev) => {
        const nextMatrix = (prev.matrix || []).map((row) => {
          if (row.id === rowId) {
            return { ...row, [channelKey]: checked };
          }
          return row;
        });
        return { ...prev, matrix: nextMatrix };
      });
    },
    [form]
  );

  const handleChannelToggle = useCallback(
    (channelKey, val) => {
      form.setValues((prev) => ({
        ...prev,
        channels: {
          ...prev.channels,
          [channelKey]: val,
        },
      }));
    },
    [form]
  );

  const handleQuietHoursToggle = useCallback(
    (field, val) => {
      form.setValues((prev) => ({
        ...prev,
        quiet_hours: {
          ...prev.quiet_hours,
          [field]: val,
        },
      }));
    },
    [form]
  );

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
          Failed to load notification settings: {error?.message || 'Server error'}
        </p>
        <button
          type="button"
          className="settings-error-banner__retry"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  const userEmail = user?.email || 'maya.chen@acme.com';

  return (
    <div className="settings-grid">
      {/* Left Column */}
      <div className="settings-grid__left">
        <SettingsCard
          title="Ticket & team activity"
          description="Choose a channel for each event. These preferences only apply to you."
        >
          <NotificationMatrix
            matrix={form.values.matrix}
            inAppChannelEnabled={form.values.channels.in_app}
            emailChannelEnabled={form.values.channels.email}
            onChangeRow={handleMatrixRowChange}
            disabled={form.isSaving}
          />
        </SettingsCard>

        <InfoCallout title="Security alerts always reach you">
          <p>
            Password changes, sign-in alerts and account security emails are always
            sent to {userEmail}.
          </p>
        </InfoCallout>
      </div>

      {/* Right Column */}
      <div className="settings-grid__right">
        <ChannelsCard
          channels={form.values.channels}
          onChangeChannel={handleChannelToggle}
          disabled={form.isSaving}
        />

        <DigestQuietHoursCard
          digest={form.values.email_digest}
          quietHours={form.values.quiet_hours}
          onChangeDigest={(v) => form.handleChange('email_digest', v)}
          onChangeQuietHours={handleQuietHoursToggle}
          disabled={form.isSaving}
        />
      </div>
    </div>
  );
}

