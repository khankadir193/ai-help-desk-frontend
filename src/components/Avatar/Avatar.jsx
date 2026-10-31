import Icon from '../Icon/Icon';
import './Avatar.css';

export default function Avatar({
  initials,
  type = 'text',
  icon = 'sparkle',
  size = 'md',
  className = '',
}) {
  return (
    <div className={`avatar avatar--${size} avatar--${type} ${className}`.trim()}>
      {type === 'icon' ? (
        <Icon name={icon} size={size === 'lg' ? 18 : 16} strokeWidth={2} />
      ) : (
        <span className="avatar__initials">{initials}</span>
      )}
    </div>
  );
}

