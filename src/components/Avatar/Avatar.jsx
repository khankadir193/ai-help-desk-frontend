import Icon from '../Icon/Icon';
import './Avatar.css';

export default function Avatar({
  initials,
  src,
  type = 'text',
  icon = 'sparkle',
  size = 'md',
  className = '',
}) {
  return (
    <div className={`avatar avatar--${size} avatar--${type} ${className}`.trim()}>
      {src ? (
        <img src={src} alt={initials || 'Avatar'} className="avatar__image" />
      ) : type === 'icon' ? (
        <Icon name={icon} size={size === 'lg' ? 18 : 16} strokeWidth={2} />
      ) : (
        <span className="avatar__initials">{initials}</span>
      )}
    </div>
  );
}

