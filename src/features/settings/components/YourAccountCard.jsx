import SettingsCard from './SettingsCard';
import Avatar from '../../../components/Avatar/Avatar';
import './YourAccountCard.css';

export default function YourAccountCard({ user, profile }) {
  const name = profile?.name || user?.name || 'Maya Chen';
  const roleName = profile?.role || user?.role || 'Support Manager';
  const workspaceName = profile?.workspace_name || 'Acme Support';
  const avatarUrl = profile?.avatar_url || user?.avatar_url;
  const initials = profile?.initials || user?.initials || 'MC';

  return (
    <SettingsCard title="Your account">
      <div className="your-account__user">
        <Avatar src={avatarUrl} initials={initials} size="lg" className="your-account__avatar" />
        <div className="your-account__meta">
          <span className="your-account__name">{name}</span>
          <span className="your-account__role">
            {roleName} · {workspaceName}
          </span>
        </div>
      </div>

      <p className="settings-muted-note">
        Your role is managed by a workspace Admin.
      </p>
    </SettingsCard>
  );
}

