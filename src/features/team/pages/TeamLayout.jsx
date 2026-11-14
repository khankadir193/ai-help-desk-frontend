import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TeamTabs from '../components/TeamTabs/TeamTabs';
import './TeamLayout.css';

export default function TeamLayout() {
  const [headerProps, setHeaderProps] = useState({
    title: 'Team members',
    subtext: 'Manage teammates, view status, and send invitations.',
    actions: null,
  });

  return (
    <div className="team-page-container">
      {/* Shared Page Header */}
      <header className="team-page-header">
        <div className="team-page-header__left">
          <h1 className="team-page-header__title">{headerProps.title}</h1>
          {headerProps.subtext && (
            <p className="team-page-header__subtext">{headerProps.subtext}</p>
          )}
        </div>

        {headerProps.actions && (
          <div className="team-page-header__actions">
            {headerProps.actions}
          </div>
        )}
      </header>

      {/* Shared Tab Bar */}
      <TeamTabs />

      {/* Page Content */}
      <main className="team-page-main">
        <Outlet context={{ setHeaderProps }} />
      </main>
    </div>
  );
}
