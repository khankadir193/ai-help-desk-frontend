import './TicketTabs.css';

export default function TicketTabs({
  activeTab = 'all',
  counts = { all: 0, mine: 0, unassigned: 0 },
  onTabChange,
  isCustomer = false,
}) {
  const tabs = isCustomer
    ? [{ id: 'all', label: 'All tickets', count: counts.all }]
    : [
        { id: 'all', label: 'All tickets', count: counts.all },
        { id: 'mine', label: 'My tickets', count: counts.mine },
        { id: 'unassigned', label: 'Unassigned', count: counts.unassigned },
      ];

  return (
    <nav className="ticket-tabs" aria-label="Ticket views">
      <div className="ticket-tabs__list" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`ticket-tabs__item ${isActive ? 'ticket-tabs__item--active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="ticket-tabs__label">{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`ticket-tabs__count ${isActive ? 'ticket-tabs__count--active' : ''}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
