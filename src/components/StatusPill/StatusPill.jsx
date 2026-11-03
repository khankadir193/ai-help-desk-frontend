import Icon from '../Icon/Icon';
import './StatusPill.css';

export default function StatusPill({ status, label }) {
  // Backend enums use underscores (IN_PROGRESS); CSS modifier classes use hyphens
  const normalized = status.toLowerCase().replace(/_/g, '-');

  return (
    <span className={`status-pill status-pill--${normalized}`}>
      {normalized === 'in-progress' && (
        <Icon name="play" size={8} className="status-pill__icon" />
      )}
      {normalized === 'open' && (
        <span className="status-pill__dot" aria-hidden="true" />
      )}
      {normalized === 'resolved' && (
        <Icon name="check" size={11} strokeWidth={2.5} className="status-pill__icon" />
      )}
      {normalized === 'active' && (
        <span className="status-pill__dot status-pill__dot--active" aria-hidden="true" />
      )}
      {normalized === 'inactive' && (
        <span className="status-pill__dot status-pill__dot--inactive" aria-hidden="true" />
      )}
      <span className="status-pill__label">{label || status}</span>
    </span>
  );
}

