import Icon from '../../../../components/Icon/Icon';
import './StatusBadge.css';

export default function StatusBadge({ status, label }) {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  let modifier;
  let defaultLabel;
  let iconElement;

  switch (normalized) {
    case 'PUBLISHED':
      modifier = 'published';
      defaultLabel = 'Published';
      iconElement = <Icon name="check" size={11} strokeWidth={2.5} className="kb-status-badge__icon" />;
      break;
    case 'IN_REVIEW':
      modifier = 'in-review';
      defaultLabel = 'In review';
      iconElement = <span className="kb-status-badge__dot" aria-hidden="true" />;
      break;
    case 'ARCHIVED':
      modifier = 'archived';
      defaultLabel = 'Archived';
      iconElement = <Icon name="square" size={8} strokeWidth={2} className="kb-status-badge__icon" fill="currentColor" />;
      break;
    case 'DRAFT':
    default:
      modifier = 'draft';
      defaultLabel = 'Draft';
      iconElement = <span className="kb-status-badge__dot" aria-hidden="true" />;
      break;
  }

  return (
    <span className={`kb-status-badge kb-status-badge--${modifier}`}>
      {iconElement}
      <span className="kb-status-badge__label">{label || defaultLabel}</span>
    </span>
  );
}
