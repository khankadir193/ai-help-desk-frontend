import { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/Icon/Icon';
import { useClickOutside } from '../../../hooks/useClickOutside';
import './TicketFilters.css';

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const PRIORITY_OPTIONS = [
  { value: 'URGENT', label: 'Urgent' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const DATE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'last_3_months', label: 'Last 3 months' },
];

const SORT_OPTIONS = [
  { value: 'updated_at:desc', label: 'Last updated' },
  { value: 'created_at:desc', label: 'Newest first' },
  { value: 'created_at:asc', label: 'Oldest first' },
];

export default function TicketFilters({
  search = '',
  onSearchChange,
  status = [],
  onStatusChange,
  priority = [],
  onPriorityChange,
  agent = '',
  onAgentChange,
  category = [],
  onCategoryChange,
  dateRange = 'last_7_days',
  onDateRangeChange,
  sort = 'updated_at',
  order = 'desc',
  onSortChange,
  categories = [],
  agents = [],
  activeTab = 'all',
  isCustomer = false,
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  useClickOutside(containerRef, () => setOpenDropdown(null));

  // ⌘K shortcut label
  const isMac = /Mac|iPhone|iPad/i.test(navigator.userAgent);
  const kbdLabel = isMac ? '⌘K' : 'Ctrl K';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && openDropdown) {
        setOpenDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openDropdown]);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const handleMultiToggle = (list, item, onChange) => {
    const exists = list.includes(item);
    const updated = exists ? list.filter((x) => x !== item) : [...list, item];
    onChange(updated);
  };

  const currentSortValue = `${sort}:${order}`;
  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.value === currentSortValue)?.label || 'Last updated';

  const currentDateLabel =
    DATE_OPTIONS.find((d) => d.value === dateRange)?.label || 'Last 7 days';

  // Agent dropdown should be hidden on "My tickets" or fixed on "Unassigned"
  const showAgentFilter = !isCustomer && activeTab === 'all';

  return (
    <div className="ticket-filters" ref={containerRef}>
      <div className="ticket-filters__row">
        {/* Search input with inside icon and ⌘K chip */}
        <div className="ticket-filters__search-wrapper">
          <Icon name="search" size={16} className="ticket-filters__search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="ticket-filters__search-input"
            placeholder="Search by subject, ID or customer..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search tickets by subject, ID or customer"
          />
          <kbd className="ticket-filters__kbd">{kbdLabel}</kbd>
        </div>

        {/* Dropdowns group */}
        <div className="ticket-filters__group">
          {/* Status Dropdown */}
          <div className="ticket-filters__dropdown-container">
            <button
              type="button"
              className={`ticket-filters__btn ${status.length > 0 ? 'ticket-filters__btn--active' : ''}`}
              onClick={() => toggleDropdown('status')}
              aria-expanded={openDropdown === 'status'}
            >
              <span>Status{status.length > 0 ? ` (${status.length})` : ''}</span>
              <Icon name="chevron-down" size={14} />
            </button>
            {openDropdown === 'status' && (
              <div className="ticket-filters__menu" role="menu">
                {STATUS_OPTIONS.map((opt) => {
                  const checked = status.includes(opt.value);
                  return (
                    <label key={opt.value} className="ticket-filters__menu-item">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleMultiToggle(status, opt.value, onStatusChange)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Priority Dropdown */}
          <div className="ticket-filters__dropdown-container">
            <button
              type="button"
              className={`ticket-filters__btn ${priority.length > 0 ? 'ticket-filters__btn--active' : ''}`}
              onClick={() => toggleDropdown('priority')}
              aria-expanded={openDropdown === 'priority'}
            >
              <span>Priority{priority.length > 0 ? ` (${priority.length})` : ''}</span>
              <Icon name="chevron-down" size={14} />
            </button>
            {openDropdown === 'priority' && (
              <div className="ticket-filters__menu" role="menu">
                {PRIORITY_OPTIONS.map((opt) => {
                  const checked = priority.includes(opt.value);
                  return (
                    <label key={opt.value} className="ticket-filters__menu-item">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleMultiToggle(priority, opt.value, onPriorityChange)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Agent Dropdown */}
          {showAgentFilter && (
            <div className="ticket-filters__dropdown-container">
              <button
                type="button"
                className={`ticket-filters__btn ${agent ? 'ticket-filters__btn--active' : ''}`}
                onClick={() => toggleDropdown('agent')}
                aria-expanded={openDropdown === 'agent'}
              >
                <span>Agent{agent ? ': 1' : ''}</span>
                <Icon name="chevron-down" size={14} />
              </button>
              {openDropdown === 'agent' && (
                <div className="ticket-filters__menu" role="menu">
                  <button
                    type="button"
                    className={`ticket-filters__menu-action ${!agent ? 'ticket-filters__menu-action--selected' : ''}`}
                    onClick={() => {
                      onAgentChange('');
                      setOpenDropdown(null);
                    }}
                  >
                    All agents
                  </button>
                  <button
                    type="button"
                    className={`ticket-filters__menu-action ${agent === 'unassigned' ? 'ticket-filters__menu-action--selected' : ''}`}
                    onClick={() => {
                      onAgentChange('unassigned');
                      setOpenDropdown(null);
                    }}
                  >
                    Unassigned
                  </button>
                  {agents.slice(0, 15).map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className={`ticket-filters__menu-action ${agent === String(a.id) ? 'ticket-filters__menu-action--selected' : ''}`}
                      onClick={() => {
                        onAgentChange(String(a.id));
                        setOpenDropdown(null);
                      }}
                    >
                      <span>{a.name}</span>
                      {typeof a.open_tickets_count === 'number' && (
                        <span className="ticket-filters__agent-count">{a.open_tickets_count} open</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Category Dropdown */}
          <div className="ticket-filters__dropdown-container">
            <button
              type="button"
              className={`ticket-filters__btn ${category.length > 0 ? 'ticket-filters__btn--active' : ''}`}
              onClick={() => toggleDropdown('category')}
              aria-expanded={openDropdown === 'category'}
            >
              <span>Category{category.length > 0 ? ` (${category.length})` : ''}</span>
              <Icon name="chevron-down" size={14} />
            </button>
            {openDropdown === 'category' && (
              <div className="ticket-filters__menu ticket-filters__menu--scrollable" role="menu">
                {categories.length === 0 ? (
                  <div className="ticket-filters__empty-hint">No categories</div>
                ) : (
                  categories.map((c) => {
                    const checked = category.includes(String(c.id));
                    return (
                      <label key={c.id} className="ticket-filters__menu-item">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleMultiToggle(category, String(c.id), onCategoryChange)}
                        />
                        <span>{c.name}</span>
                      </label>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Date Range Dropdown */}
          <div className="ticket-filters__dropdown-container">
            <button
              type="button"
              className="ticket-filters__btn"
              onClick={() => toggleDropdown('date')}
              aria-expanded={openDropdown === 'date'}
            >
              <Icon name="calendar" size={14} />
              <span>{currentDateLabel}</span>
              <Icon name="chevron-down" size={14} />
            </button>
            {openDropdown === 'date' && (
              <div className="ticket-filters__menu" role="menu">
                {DATE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`ticket-filters__menu-action ${dateRange === opt.value ? 'ticket-filters__menu-action--selected' : ''}`}
                    onClick={() => {
                      onDateRangeChange(opt.value);
                      setOpenDropdown(null);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sort Dropdown (Right-aligned) */}
        <div className="ticket-filters__sort-wrapper">
          <div className="ticket-filters__dropdown-container">
            <button
              type="button"
              className="ticket-filters__btn ticket-filters__btn--sort"
              onClick={() => toggleDropdown('sort')}
              aria-expanded={openDropdown === 'sort'}
            >
              <span>Sort: {currentSortLabel}</span>
              <Icon name="chevron-down" size={14} />
            </button>
            {openDropdown === 'sort' && (
              <div className="ticket-filters__menu ticket-filters__menu--right" role="menu">
                {SORT_OPTIONS.map((opt) => {
                  const [s, o] = opt.value.split(':');
                  const selected = sort === s && order === o;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`ticket-filters__menu-action ${selected ? 'ticket-filters__menu-action--selected' : ''}`}
                      onClick={() => {
                        onSortChange(s, o);
                        setOpenDropdown(null);
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
