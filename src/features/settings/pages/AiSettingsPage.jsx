import { useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import SettingsCard from '../components/SettingsCard';
import Toggle from '../components/Toggle';
import AiNoteCard from '../components/AiNoteCard';
import KnowledgeSourcesCard from '../components/KnowledgeSourcesCard';
import DraftBehaviorCard from '../components/DraftBehaviorCard';
import AgentPreviewCard from '../components/AgentPreviewCard';
import useAiSettings from '../hooks/useAiSettings';
import useSettingsForm from '../hooks/useSettingsForm';
import { useAuth } from '../../auth/hooks/useAuth';
import './AiSettingsPage.css';

export default function AiSettingsPage() {
  const { setSaveBarProps } = useOutletContext();
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const initialValues = useMemo(
    () => ({
      ai_enabled: true,
      redact_sensitive: true,
      default_tone: 'FRIENDLY_PROFESSIONAL',
      draft_mode: 'ON_REQUEST',
    }),
    []
  );

  const {
    aiData,
    previewData,
    isLoading,
    isPreviewLoading,
    isError,
    error,
    refetchAi,
    refetchPreview,
    updateAi,
  } = useAiSettings();

  const handleSave = useCallback(
    async (changedFields) => {
      const updated = await updateAi(changedFields);
      return {
        ai_enabled: updated.ai_enabled,
        redact_sensitive: updated.redact_sensitive,
        default_tone: updated.default_tone,
        draft_mode: updated.draft_mode,
      };
    },
    [updateAi]
  );

  const form = useSettingsForm({
    initialValues: aiData || initialValues,
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
          Failed to load AI settings: {error?.message || 'Server error'}
        </p>
        <button
          type="button"
          className="settings-error-banner__retry"
          onClick={() => refetchAi()}
        >
          Retry
        </button>
      </div>
    );
  }

  const isAiDisabled = !form.values.ai_enabled;

  return (
    <div className="settings-grid">
      {/* Left Column */}
      <div className="settings-grid__left">
        {/* Enablement & Privacy Card */}
        <SettingsCard
          title="Enablement & privacy"
          headerAction={
            !isAdmin ? (
              <span className="settings-badge-readonly">Managed by an Admin</span>
            ) : null
          }
        >
          {/* Enable AI Assistance */}
          <div className="ai-settings__toggle-row">
            <div className="ai-settings__toggle-info">
              <span className="ai-settings__toggle-title">Enable AI assistance</span>
              <span className="ai-settings__toggle-desc">
                Suggest replies, summarize tickets and recommend articles.
              </span>
            </div>
            <Toggle
              checked={Boolean(form.values.ai_enabled)}
              onChange={(checked) => form.handleChange('ai_enabled', checked)}
              disabled={!isAdmin || form.isSaving}
              ariaLabel="Enable AI assistance"
            />
          </div>

          <div className="settings-divider" />

          {/* Redact Sensitive Information */}
          <div className="ai-settings__toggle-row">
            <div className="ai-settings__toggle-info">
              <span className="ai-settings__toggle-title">Redact sensitive information</span>
              <span className="ai-settings__toggle-desc">
                Remove detected personal data before AI processing.
              </span>
            </div>
            <Toggle
              checked={Boolean(form.values.redact_sensitive)}
              onChange={(checked) => form.handleChange('redact_sensitive', checked)}
              disabled={!isAdmin || isAiDisabled || form.isSaving}
              ariaLabel="Redact sensitive information"
            />
          </div>

          <p className="settings-muted-note">
            Workspace content is not used to train shared AI models.
          </p>
        </SettingsCard>

        {/* Knowledge Sources Card */}
        <KnowledgeSourcesCard
          knowledgeSources={aiData?.knowledge_sources}
        />

        {/* Draft Behavior Card */}
        <DraftBehaviorCard
          tone={form.values.default_tone}
          draftMode={form.values.draft_mode}
          onChangeTone={(v) => form.handleChange('default_tone', v)}
          onChangeDraftMode={(v) => form.handleChange('draft_mode', v)}
          disabled={!isAdmin || isAiDisabled || form.isSaving}
        />
      </div>

      {/* Right Column */}
      <div className="settings-grid__right">
        <AiNoteCard title="Human review is always required">
          <p>
            Every AI output is labeled AI-generated. An agent must review, edit
            and explicitly send each reply. AI never auto-sends messages.
          </p>
        </AiNoteCard>

        <AgentPreviewCard
          previewText={previewData?.suggested_reply}
          isLoading={isPreviewLoading}
          onRefresh={refetchPreview}
          disabled={isAiDisabled}
        />
      </div>
    </div>
  );
}

