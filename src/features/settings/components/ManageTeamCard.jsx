import { useNavigate } from 'react-router-dom';
import SettingsCard from './SettingsCard';
import './ManageTeamCard.css';

export default function ManageTeamCard({ team }) {
  const navigate = useNavigate();

  const activeMembers = team?.active_members_count ?? 12;
  const pendingInvites = team?.pending_invites_count ?? 2;

  return (
    <SettingsCard
      title="Manage your team"
      description="Membership is managed separately from routing preferences."
    >
      <div className="manage-team__stats">
        <div className="manage-team__stat">
          <span className="manage-team__stat-number">{activeMembers}</span>
          <span className="manage-team__stat-label">Active members</span>
        </div>
        <div className="manage-team__stat">
          <span className="manage-team__stat-number">{pendingInvites}</span>
          <span className="manage-team__stat-label">Pending invites</span>
        </div>
      </div>

      <div className="settings-divider" />

      <div className="manage-team__actions">
        <button
          type="button"
          className="settings-btn-outline manage-team__btn"
          onClick={() => navigate('/team')}
        >
          Manage members
        </button>
        <button
          type="button"
          className="settings-btn-outline manage-team__btn"
          onClick={() => navigate('/team/members/invite')}
        >
          Invite member
        </button>
      </div>

      <p className="settings-muted-note">
        View profiles, resend invitations and manage member access in Team → Members.
      </p>
    </SettingsCard>
  );
}

