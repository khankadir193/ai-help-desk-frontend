import { NavLink } from 'react-router-dom';
import './SettingsTabs.css';

const TABS = [
  { id: 'general', label: 'General', path: '/settings/general' },
  { id: 'profile', label: 'Profile', path: '/settings/profile' },
  { id: 'team', label: 'Team', path: '/settings/team' },
  { id: 'notifications', label: 'Notifications', path: '/settings/notifications' },
  { id: 'ai', label: 'AI', path: '/settings/ai' },
];

export default function SettingsTabs({ onTabClick }) {
  return (
    <nav className="settings-tabs" aria-label="Settings navigation">
      <ul className="settings-tabs__list">
        {TABS.map((tab) => (
          <li key={tab.id} className="settings-tabs__item">
            <NavLink
              to={tab.path}
              className={({ isActive }) =>
                `settings-tabs__link ${isActive ? 'settings-tabs__link--active' : ''}`
              }
              onClick={(e) => {
                if (onTabClick) {
                  const allowed = onTabClick(tab.path);
                  if (allowed === false) {
                    e.preventDefault();
                  }
                }
              }}
            >
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

