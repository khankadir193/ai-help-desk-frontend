import SettingsCard from './SettingsCard';
import { formatSettingsDate } from '../utils/settingsFormatters';
import './AboutWorkspaceCard.css';

export default function AboutWorkspaceCard({ workspace }) {
  return (
    <SettingsCard title="About this workspace">
      <div className="about-workspace__rows">
        <div className="about-workspace__row">
          <span className="about-workspace__label">Workspace ID</span>
          <span className="about-workspace__value">{workspace?.workspace_id || 'ws_acme_001'}</span>
        </div>
        <div className="about-workspace__row">
          <span className="about-workspace__label">Created</span>
          <span className="about-workspace__value">{formatSettingsDate(workspace?.created_at)}</span>
        </div>
        <div className="about-workspace__row">
          <span className="about-workspace__label">Workspace owner</span>
          <span className="about-workspace__value">{workspace?.owner_name || 'Alex Morgan'}</span>
        </div>
      </div>

      <div className="settings-divider" />

      <p className="settings-muted-note">
        Need to transfer ownership? Contact your workspace Admin.
      </p>
    </SettingsCard>
  );
}

