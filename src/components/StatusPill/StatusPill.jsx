import Icon from '../Icon/Icon';
import './StatusPill.css';

export default function StatusPill({ status, priority, label, className = '' }) {
  const value = String(priority || status || '').toLowerCase().replace(/_/g, '-');
  const displayLabel = label || (
    value === 'in-progress'
      ? 'In Progress'
      : value.charAt(0).toUpperCase() + value.slice(1)
  );

  const isPriority = Boolean(priority);

  return (
    <span
      className={`status-pill status-pill--${value} ${isPriority ? 'status-pill--priority' : ''} ${className}`.trim()}
    >
      {/* Priority icons */}
      {value === 'urgent' && (
        <Icon name="alert-triangle" size={11} strokeWidth={2.2} className="status-pill__icon" />
      )}
      {value === 'high' && (
        <Icon name="arrow-up" size={11} strokeWidth={2.5} className="status-pill__icon" />
      )}
      {value === 'medium' && (
        <Icon name="minus" size={11} strokeWidth={2.5} className="status-pill__icon" />
      )}
      {value === 'low' && (
        <Icon name="arrow-down" size={11} strokeWidth={2.5} className="status-pill__icon" />
      )}

      {/* Status icons */}
      {value === 'open' && (
        <span className="status-pill__circle-dot" aria-hidden="true" />
      )}
      {value === 'in-progress' && (
        <span className="status-pill__half-dot" aria-hidden="true" />
      )}
      {value === 'pending' && (
        <span className="status-pill__dot status-pill__dot--pending" aria-hidden="true" />
      )}
      {value === 'resolved' && (
        <Icon name="check" size={11} strokeWidth={2.5} className="status-pill__icon" />
      )}
      {value === 'closed' && (
        <span className="status-pill__square" aria-hidden="true" />
      )}
      {value === 'active' && (
        <span className="status-pill__dot status-pill__dot--active" aria-hidden="true" />
      )}
      {value === 'inactive' && (
        <span className="status-pill__dot status-pill__dot--inactive" aria-hidden="true" />
      )}

      <span className="status-pill__label">{displayLabel}</span>
    </span>
  );
}
