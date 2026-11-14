import { useEffect, useMemo, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import SettingsCard from '../components/SettingsCard';
import SelectField from '../components/SelectField';
import Toggle from '../components/Toggle';
import InfoCallout from '../components/InfoCallout';
import ManageTeamCard from '../components/ManageTeamCard';
import useTeamSettings from '../hooks/useTeamSettings';
import useSettingsForm from '../hooks/useSettingsForm';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  TICKET_PRIORITIES,
  ASSIGNMENT_METHODS,
  FALLBACK_ACTIONS,
} from '../utils/settingsConstants';
import './TeamSettingsPage.css';

export default function TeamSettingsPage() {
  const { setSaveBarProps } = useOutletContext();
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const {
    team,
    isLoading,
    isError,
    error,
    refetch,
    updateTeam,
  } = useTeamSettings();

  const initialValues = useMemo(
    () => ({
      default_team: team?.default_team || 'Customer Support',
      default_priority: team?.default_priority || 'MEDIUM',
      assignment_method: team?.assignment_method || 'ROUND_ROBIN',
      fallback_action: team?.fallback_action || 'UNASSIGNED_QUEUE',
      route_available_only: team?.route_available_only ?? true,
    }),
    [team]
  );

  const handleSave = useCallback(
    async (changedFields) => {
      const updated = await updateTeam(changedFields);
      return {
        default_team: updated.default_team,
        default_priority: updated.default_priority,
        assignment_method: updated.assignment_method,
        fallback_action: updated.fallback_action,
        route_available_only: updated.route_available_only,
      };
    },
    [updateTeam]
  );

  const form = useSettingsForm({
    initialValues,
    onSave: handleSave,
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
          Failed to load team settings: {error?.message || 'Server error'}
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

  const teamOptions = team?.options?.teams || [
    'Customer Support',
    'Technical Support',
    'Billing & Account',
    'VIP Triage',
  ];

  return (
    <div className="settings-grid">
      {/* Left Column */}
      <div className="settings-grid__left">
        {/* Team Defaults & Routing Card */}
        <SettingsCard
          title="Team defaults & routing"
          description="Applied to new tickets in your support team."
          headerAction={
            !isAdmin ? (
              <span className="settings-badge-readonly">Managed by an Admin</span>
            ) : null
          }
        >
          <div className="settings-row-2col">
            <SelectField
              id="default-team"
              label="Default team"
              value={form.values.default_team}
              onChange={(v) => form.handleChange('default_team', v)}
              options={teamOptions}
              disabled={!isAdmin || form.isSaving}
            />

            <SelectField
              id="default-priority"
              label="Default ticket priority"
              value={form.values.default_priority}
              onChange={(v) => form.handleChange('default_priority', v)}
              options={TICKET_PRIORITIES}
              disabled={!isAdmin || form.isSaving}
            />
          </div>

          <div className="settings-row-2col">
            <SelectField
              id="assignment-method"
              label="Assignment method"
              value={form.values.assignment_method}
              onChange={(v) => form.handleChange('assignment_method', v)}
              options={ASSIGNMENT_METHODS}
              disabled={!isAdmin || form.isSaving}
            />

            <SelectField
              id="fallback-action"
              label="When no agent is available"
              value={form.values.fallback_action}
              onChange={(v) => form.handleChange('fallback_action', v)}
              options={FALLBACK_ACTIONS}
              disabled={!isAdmin || form.isSaving}
            />
          </div>

          <div className="settings-divider" />

          {/* Availability Toggle Row */}
          <div className="team-settings__toggle-row">
            <div className="team-settings__toggle-info">
              <span className="team-settings__toggle-title">
                Route to available agents only
              </span>
              <span className="team-settings__toggle-desc">
                Skip agents who are away or at their ticket capacity.
              </span>
            </div>
            <Toggle
              checked={form.values.route_available_only}
              onChange={(checked) => form.handleChange('route_available_only', checked)}
              disabled={!isAdmin || form.isSaving}
              ariaLabel="Route to available agents only"
            />
          </div>
        </SettingsCard>

        {/* Roles & Access Card */}
        <SettingsCard title="Roles & access">
          <div className="team-settings__role-row">
            <div className="team-settings__role-info">
              <span className="team-settings__role-title">Default invitation role</span>
              <span className="team-settings__role-desc">
                Support Agent · Assigned tickets and draft articles
              </span>
            </div>
            <span className="team-settings__admin-managed">Admin managed</span>
          </div>

          <div className="settings-divider" />

          <div className="team-settings__link-row">
            <span className="settings-muted-note">
              Review role access in member administration.
            </span>
            <Link to="/team/roles" className="settings-link">
              Roles & permissions
            </Link>
          </div>
        </SettingsCard>
      </div>

      {/* Right Column */}
      <div className="settings-grid__right">
        <ManageTeamCard team={team} />

        <InfoCallout title="Routing does not change access">
          <p>
            Assignment rules only route tickets. Only Admins can change workspace
            roles or deactivate members.
          </p>
        </InfoCallout>
      </div>
    </div>
  );
}

