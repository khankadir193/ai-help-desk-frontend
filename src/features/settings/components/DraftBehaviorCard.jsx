import SettingsCard from './SettingsCard';
import SelectField from './SelectField';
import { AI_REPLY_TONES, AI_DRAFT_MODES } from '../utils/settingsConstants';
import './DraftBehaviorCard.css';

export default function DraftBehaviorCard({
  tone = 'FRIENDLY_PROFESSIONAL',
  draftMode = 'ON_REQUEST',
  onChangeTone,
  onChangeDraftMode,
  disabled = false,
}) {
  return (
    <SettingsCard title="Draft behavior">
      <div className="settings-row-2col">
        <SelectField
          id="default-reply-tone"
          label="Default reply tone"
          value={tone}
          onChange={onChangeTone}
          options={AI_REPLY_TONES}
          disabled={disabled}
        />

        <SelectField
          id="create-draft-suggestions"
          label="Create draft suggestions"
          value={draftMode}
          onChange={onChangeDraftMode}
          options={AI_DRAFT_MODES}
          disabled={disabled}
        />
      </div>

      <p className="settings-muted-note">
        Suggestions include source references when available. Agents must verify facts before sending.
      </p>
    </SettingsCard>
  );
}

