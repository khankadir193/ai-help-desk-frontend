import { useState, useRef, useEffect } from 'react';
import { useClickOutside } from '../../../../hooks/useClickOutside';
import './ReportsFilters.css';

const DATE_PRESETS = [
  { id: '7d', label: 'Last 7 days' },
  { id: '14d', label: 'Last 14 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: 'this_month', label: 'This month' },
];

const TEAM_OPTIONS = [
  { id: 'all', label: 'All teams' },
  { id: 'tier1', label: 'Tier 1 Support' },
  { id: 'tier2', label: 'Tier 2 Escalations' },
  { id: 'billing', label: 'Billing & Accounts' },
];

const CHANNEL_OPTIONS = [
  { id: 'all', label: 'All channels' },
  { id: 'email', label: 'Email' },
  { id: 'web', label: 'Web Portal' },
  { id: 'chat', label: 'Live Chat' },
  { id: 'api', label: 'API' },
];

/**
 * Chevron icon rendered via inline SVG
 */
function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="reports-filter__chevron"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/**
 * ReportsFilters
 *
 * Left: 3 dropdown menus (Date range, Team, Channel) with full keyboard accessibility.
 * Right: Backlog summary string.
 */
export default function ReportsFilters({
  dateRangeLabel,
  selectedPreset,
  onSelectPreset,
  selectedTeam,
  onSelectTeam,
  selectedChannel,
  onSelectChannel,
  backlogSummary,
}) {
  const [openDropdown, setOpenDropdown] = useState(null); // 'date' | 'team' | 'channel' | null

  const dateRef = useRef(null);
  const teamRef = useRef(null);
  const channelRef = useRef(null);

  useClickOutside(dateRef, () => {
    if (openDropdown === 'date') setOpenDropdown(null);
  });
  useClickOutside(teamRef, () => {
    if (openDropdown === 'team') setOpenDropdown(null);
  });
  useClickOutside(channelRef, () => {
    if (openDropdown === 'channel') setOpenDropdown(null);
  });

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const currentTeamLabel =
    TEAM_OPTIONS.find((t) => t.id === selectedTeam)?.label || 'All teams';
  const currentChannelLabel =
    CHANNEL_OPTIONS.find((c) => c.id === selectedChannel)?.label || 'All channels';

  // Format backlog string
  const openCount = backlogSummary?.open ?? 128;
  const unassignedCount = backlogSummary?.unassigned ?? 17;
  const inProgressCount = backlogSummary?.in_progress ?? 54;

  return (
    <section className="reports-filters-row" aria-label="Report Filters and Backlog Summary">
      <div className="reports-filters__controls">
        {/* 1. Date Range Dropdown */}
        <div className="reports-filter-dropdown" ref={dateRef}>
          <button
            type="button"
            className="reports-filter-btn"
            onClick={() => toggleDropdown('date')}
            aria-expanded={openDropdown === 'date'}
            aria-haspopup="menu"
            aria-label="Filter by date range"
          >
            <span>{dateRangeLabel || 'Oct 23 – Oct 29, 2026'}</span>
            <ChevronDownIcon />
          </button>

          {openDropdown === 'date' && (
            <div className="reports-dropdown-menu" role="menu">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  role="menuitem"
                  className={`reports-dropdown-item ${
                    selectedPreset === preset.id ? 'reports-dropdown-item--active' : ''
                  }`}
                  onClick={() => {
                    onSelectPreset(preset.id);
                    setOpenDropdown(null);
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Team Dropdown */}
        <div className="reports-filter-dropdown" ref={teamRef}>
          <button
            type="button"
            className="reports-filter-btn"
            onClick={() => toggleDropdown('team')}
            aria-expanded={openDropdown === 'team'}
            aria-haspopup="menu"
            aria-label="Filter by team"
          >
            <span>{currentTeamLabel}</span>
            <ChevronDownIcon />
          </button>

          {openDropdown === 'team' && (
            <div className="reports-dropdown-menu" role="menu">
              {TEAM_OPTIONS.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  role="menuitem"
                  className={`reports-dropdown-item ${
                    selectedTeam === team.id ? 'reports-dropdown-item--active' : ''
                  }`}
                  onClick={() => {
                    onSelectTeam(team.id);
                    setOpenDropdown(null);
                  }}
                >
                  {team.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Channel Dropdown */}
        <div className="reports-filter-dropdown" ref={channelRef}>
          <button
            type="button"
            className="reports-filter-btn"
            onClick={() => toggleDropdown('channel')}
            aria-expanded={openDropdown === 'channel'}
            aria-haspopup="menu"
            aria-label="Filter by channel"
          >
            <span>{currentChannelLabel}</span>
            <ChevronDownIcon />
          </button>

          {openDropdown === 'channel' && (
            <div className="reports-dropdown-menu" role="menu">
              {CHANNEL_OPTIONS.map((channel) => (
                <button
                  key={channel.id}
                  type="button"
                  role="menuitem"
                  className={`reports-dropdown-item ${
                    selectedChannel === channel.id ? 'reports-dropdown-item--active' : ''
                  }`}
                  onClick={() => {
                    onSelectChannel(channel.id);
                    setOpenDropdown(null);
                  }}
                >
                  {channel.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Backlog summary */}
      <div className="reports-backlog-summary">
        Current backlog: <strong className="tabular-nums">{openCount}</strong> open ·{' '}
        <strong className="tabular-nums">{unassignedCount}</strong> unassigned ·{' '}
        <strong className="tabular-nums">{inProgressCount}</strong> in progress
      </div>
    </section>
  );
}

