import { useEffect, useState, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import SettingsCard from '../components/SettingsCard';
import FormField from '../components/FormField';
import SelectField from '../components/SelectField';
import InfoCallout from '../components/InfoCallout';
import AboutWorkspaceCard from '../components/AboutWorkspaceCard';
import useGeneralSettings from '../hooks/useGeneralSettings';
import useSettingsForm from '../hooks/useSettingsForm';
import { useAuth } from '../../auth/hooks/useAuth';
import { TIMEZONES, LANGUAGES } from '../utils/settingsConstants';
import {
  validateRequired,
  validateEmail,
  validateWorkspaceUrl,
} from '../utils/settingsValidators';
import settingsService from '../services/settingsService';
import './GeneralSettingsPage.css';

export default function GeneralSettingsPage() {
  const { setSaveBarProps } = useOutletContext();
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const {
    workspace,
    isLoading,
    isError,
    error,
    refetch,
    updateWorkspace,
  } = useGeneralSettings();

  const [urlCheckStatus, setUrlCheckStatus] = useState(null); // { available, checkedUrl }

  const initialValues = useMemo(
    () => ({
      name: workspace?.name || '',
      url: workspace?.url ? workspace.url.replace(/\.helpdesk\.ai$/, '') : '',
      support_email: workspace?.support_email || '',
      timezone: workspace?.timezone || '(UTC-08:00) Pacific Time',
      language: workspace?.language || 'English (United States)',
    }),
    [workspace]
  );

  const customValidate = useCallback((vals) => {
    const errs = {};
    const nameErr = validateRequired(vals.name, 'Workspace name');
    if (nameErr) errs.name = nameErr;

    const urlErr = validateWorkspaceUrl(vals.url);
    if (urlErr) errs.url = urlErr;

    const emailErr = validateEmail(vals.support_email);
    if (emailErr) errs.support_email = emailErr;

    return errs;
  }, []);

  const handleSave = useCallback(
    async (changedFields) => {
      const payload = { ...changedFields };
      if (payload.url) {
        payload.url = `${payload.url.toLowerCase().trim()}.helpdesk.ai`;
      }
      const updated = await updateWorkspace(payload);
      return {
        name: updated.name,
        url: updated.url.replace(/\.helpdesk\.ai$/, ''),
        support_email: updated.support_email,
        timezone: updated.timezone,
        language: updated.language,
      };
    },
    [updateWorkspace]
  );

  const form = useSettingsForm({
    initialValues,
    onSave: handleSave,
    validate: customValidate,
  });

  // Debounced URL check
  useEffect(() => {
    const clean = form.values.url?.trim().toLowerCase();
    if (!clean || form.values.url === initialValues.url || clean.length < 3) {
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const res = await settingsService.checkWorkspaceUrl(clean);
        if (isMounted) {
          setUrlCheckStatus({
            available: res.available,
            checkedUrl: clean,
          });
        }
      } catch {
        if (isMounted) {
          setUrlCheckStatus(null);
        }
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [form.values.url, initialValues.url]);

  // Sync save bar with layout
  useEffect(() => {
    setSaveBarProps({
      isDirty: form.isDirty,
      isSaving: form.isSaving,
      isSuccess: form.isSuccess,
      saveError: form.saveError,
      onSave: form.handleSubmit,
      onCancel: form.handleCancel,
      disabled: !isAdmin,
    });
  }, [
    setSaveBarProps,
    form.isDirty,
    form.isSaving,
    form.isSuccess,
    form.saveError,
    form.handleSubmit,
    form.handleCancel,
    isAdmin,
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
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="settings-error-banner">
        <p className="settings-error-banner__text">
          Failed to load workspace settings: {error?.message || 'Server error'}
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

  return (
    <div className="settings-grid">
      {/* Left Column: Form Cards */}
      <div className="settings-grid__left">
        {/* Workspace Details Card */}
        <SettingsCard
          title="Workspace details"
          description="The identity your team sees across HelpDesk AI."
          headerAction={
            !isAdmin ? (
              <span className="settings-badge-readonly">Managed by an Admin</span>
            ) : null
          }
        >
          <div className="settings-row-2col">
            <FormField
              id="workspace-name"
              label="Workspace name"
              value={form.values.name}
              onChange={(v) => form.handleChange('name', v)}
              onBlur={() => form.handleBlur('name')}
              placeholder="Acme Support"
              error={form.errors.name}
              disabled={!isAdmin || form.isSaving}
              required
            />

            <FormField
              id="workspace-url"
              label="Workspace URL"
              value={form.values.url}
              onChange={(v) => form.handleChange('url', v)}
              onBlur={() => form.handleBlur('url')}
              placeholder="acme"
              suffix=".helpdesk.ai"
              error={form.errors.url}
              disabled={!isAdmin || form.isSaving}
              helperText={
                urlCheckStatus && urlCheckStatus.checkedUrl === form.values.url.trim().toLowerCase() ? (
                  urlCheckStatus.available ? (
                    <span className="general-settings__url-avail">✓ URL is available</span>
                  ) : (
                    <span className="general-settings__url-taken">✕ URL is already taken</span>
                  )
                ) : null
              }
              required
            />
          </div>

          <FormField
            id="support-email"
            label="Support email"
            type="email"
            value={form.values.support_email}
            onChange={(v) => form.handleChange('support_email', v)}
            onBlur={() => form.handleBlur('support_email')}
            placeholder="support@acme.com"
            helperText="Customer replies are delivered to this shared inbox."
            error={form.errors.support_email}
            disabled={!isAdmin || form.isSaving}
            required
          />
        </SettingsCard>

        {/* Region & Language Card */}
        <SettingsCard
          title="Region & language"
          description="Used for ticket timestamps, reports and new team members."
        >
          <div className="settings-row-2col">
            <SelectField
              id="timezone"
              label="Timezone"
              value={form.values.timezone}
              onChange={(v) => form.handleChange('timezone', v)}
              options={TIMEZONES}
              disabled={!isAdmin || form.isSaving}
            />

            <SelectField
              id="language"
              label="Language"
              value={form.values.language}
              onChange={(v) => form.handleChange('language', v)}
              options={LANGUAGES}
              disabled={!isAdmin || form.isSaving}
            />
          </div>

          <div className="settings-divider" />

          <p className="settings-muted-note">
            Dates follow your workspace timezone. Members can set their own notification hours.
          </p>
        </SettingsCard>
      </div>

      {/* Right Column: Info Cards */}
      <div className="settings-grid__right">
        <AboutWorkspaceCard workspace={workspace} />

        <InfoCallout title="Workspace-wide defaults">
          <p>
            These settings apply to {form.values.name || 'your workspace'}. Your name,
            password and security preferences live in Profile.
          </p>
        </InfoCallout>
      </div>
    </div>
  );
}
