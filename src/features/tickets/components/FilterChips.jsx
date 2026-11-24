import Icon from '../../../components/Icon/Icon';
import './FilterChips.css';

const STATUS_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  PENDING: 'Pending',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const PRIORITY_LABELS = {
  URGENT: 'Urgent',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

const DATE_LABELS = {
  today: 'Today',
  yesterday: 'Yesterday',
  last_7_days: 'Last 7 days',
  last_30_days: 'Last 30 days',
  last_3_months: 'Last 3 months',
};

export default function FilterChips({
  search = '',
  totalResults = 0,
  status = [],
  priority = [],
  agent = '',
  category = [],
  dateRange = 'last_7_days',
  onRemoveStatus,
  onRemovePriority,
  onRemoveAgent,
  onRemoveCategory,
  onRemoveDate,
  onClearAll,
  categories = [],
  agents = [],
}) {
  const hasActiveFilters =
    Boolean(search) ||
    status.length > 0 ||
    priority.length > 0 ||
    Boolean(agent) ||
    category.length > 0 ||
    dateRange !== 'last_7_days';

  if (!hasActiveFilters) return null;

  const agentLabel =
    agent === 'unassigned'
      ? 'Unassigned'
      : agents.find((a) => String(a.id) === String(agent))?.name || agent;

  const categoryNames = category
    .map((cId) => categories.find((c) => String(c.id) === String(cId))?.name)
    .filter(Boolean)
    .join(', ');

  return (
    <div className="filter-chips">
      <div className="filter-chips__left">
        {search && (
          <span className="filter-chips__result-count">
            {totalResults} {totalResults === 1 ? 'result' : 'results'} for &ldquo;{search}&rdquo; ·
          </span>
        )}

        {priority.length > 0 && (
          <span className="filter-chip">
            <span>Priority: {priority.map((p) => PRIORITY_LABELS[p] || p).join(', ')}</span>
            <button
              type="button"
              className="filter-chip__remove"
              onClick={onRemovePriority}
              aria-label="Remove priority filter"
            >
              <Icon name="x" size={12} />
            </button>
          </span>
        )}

        {status.length > 0 && (
          <span className="filter-chip">
            <span>Status: {status.map((s) => STATUS_LABELS[s] || s).join(', ')}</span>
            <button
              type="button"
              className="filter-chip__remove"
              onClick={onRemoveStatus}
              aria-label="Remove status filter"
            >
              <Icon name="x" size={12} />
            </button>
          </span>
        )}

        {dateRange && dateRange !== 'last_7_days' && (
          <span className="filter-chip">
            <span>Date: {DATE_LABELS[dateRange] || dateRange}</span>
            <button
              type="button"
              className="filter-chip__remove"
              onClick={onRemoveDate}
              aria-label="Remove date filter"
            >
              <Icon name="x" size={12} />
            </button>
          </span>
        )}

        {agent && (
          <span className="filter-chip">
            <span>Agent: {agentLabel}</span>
            <button
              type="button"
              className="filter-chip__remove"
              onClick={onRemoveAgent}
              aria-label="Remove agent filter"
            >
              <Icon name="x" size={12} />
            </button>
          </span>
        )}

        {category.length > 0 && categoryNames && (
          <span className="filter-chip">
            <span>Category: {categoryNames}</span>
            <button
              type="button"
              className="filter-chip__remove"
              onClick={onRemoveCategory}
              aria-label="Remove category filter"
            >
              <Icon name="x" size={12} />
            </button>
          </span>
        )}

        <button
          type="button"
          className="filter-chips__clear-btn"
          onClick={onClearAll}
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
