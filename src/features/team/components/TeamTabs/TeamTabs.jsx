import { NavLink, useLocation } from 'react-router-dom';
import './TeamTabs.css';

const TABS = [
  {
    id: 'members',
    label: 'Members',
    path: '/team',
    // On /team/members/invite or /team, Members tab should be active
    isActive: (pathname) => pathname === '/team' || pathname.startsWith('/team/members'),
  },
  {
    id: 'performance',
    label: 'Performance',
    path: '/team/performance',
    isActive: (pathname) => pathname.startsWith('/team/performance'),
  },
  {
    id: 'roles',
    label: 'Roles & permissions',
    path: '/team/roles',
    isActive: (pathname) => pathname.startsWith('/team/roles'),
  },
];

export default function TeamTabs() {
  const location = useLocation();

  return (
    <nav className="team-tabs" aria-label="Team section tabs">
      <div className="team-tabs__list" role="tablist">
        {TABS.map((tab) => {
          const active = tab.isActive(location.pathname);
          return (
            <NavLink
              key={tab.id}
              to={tab.path}
              className={`team-tabs__link ${active ? 'team-tabs__link--active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
