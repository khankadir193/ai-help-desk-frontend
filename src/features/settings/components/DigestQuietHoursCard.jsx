import SettingsCard from './SettingsCard';
import SelectField from './SelectField';
import Toggle from './Toggle';
import { EMAIL_DIGEST_OPTIONS } from '../utils/settingsConstants';
import './DigestQuietHoursCard.css';

export default function DigestQuietHoursCard({
  digest = 'DAILY_8AM',
  quietHours = {},
  onChangeDigest,
  onChangeQuietHours,
  disabled = false,
}) {
  return (
    <SettingsCard title="Digest & quiet hours">
      <SelectField
        id="email-digest"
        label="Email digest"
        value={digest}
        onChange={onChangeDigest}
        options={EMAIL_DIGEST_OPTIONS}
        disabled={disabled}
      />

      <div className="digest-quiet__row">
        <div className="digest-quiet__info">
          <span className="digest-quiet__title">Quiet hours</span>
          <span className="digest-quiet__desc">
            Pause event emails from 6 PM to 8 AM.
          </span>
        </div>
        <Toggle
          checked={Boolean(quietHours.enabled)}
          onChange={(v) => onChangeQuietHours('enabled', v)}
          disabled={disabled}
          ariaLabel="Quiet hours"
        />
      </div>

      <p className="settings-muted-note">
        Pacific Time (UTC-08:00). Security alerts are delivered immediately, even during quiet hours.
      </p>
    </SettingsCard>
  );
}

