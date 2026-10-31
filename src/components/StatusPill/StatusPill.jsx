import Icon from '../Icon/Icon';
import './StatusPill.css';

export default function StatusPill({ status, label }) {
  const normalized = status.toLowerCase();

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
      <span className="status-pill__label">{label || status}</span>
    </span>
  );
}

