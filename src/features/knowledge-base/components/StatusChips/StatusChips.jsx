import './StatusChips.css';

export default function StatusChips({ currentStatus = 'ALL', statusCounts = {}, onSelectStatus }) {
  const chips = [
    { key: 'ALL', label: 'All articles', count: statusCounts.all ?? 0 },
    { key: 'PUBLISHED', label: 'Published', count: statusCounts.published ?? 0 },
    { key: 'DRAFT', label: 'Draft', count: statusCounts.draft ?? 0 },
    { key: 'IN_REVIEW', label: 'In review', count: statusCounts.in_review ?? 0 },
    { key: 'ARCHIVED', label: 'Archived', count: statusCounts.archived ?? 0 },
  ];

  return (
    <div className="kb-status-chips" role="group" aria-label="Filter articles by status">
      {chips.map((chip) => {
        const isActive = (currentStatus || 'ALL').toUpperCase() === chip.key;
        return (
          <button
            key={chip.key}
            type="button"
            className={`kb-status-chip ${isActive ? 'kb-status-chip--active' : ''}`}
            onClick={() => onSelectStatus(chip.key)}
            aria-pressed={isActive}
          >
            <span className="kb-status-chip__label">{chip.label}</span>
            <span className="kb-status-chip__count">{chip.count}</span>
          </button>
        );
      })}
    </div>
  );
}

