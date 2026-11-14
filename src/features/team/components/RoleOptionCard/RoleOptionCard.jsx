import './RoleOptionCard.css';

export default function RoleOptionCard({
  role,
  selected = false,
  disabled = false,
  onSelect,
}) {
  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect(role.id);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !disabled && onSelect) {
      e.preventDefault();
      onSelect(role.id);
    }
  };

  const cardClasses = [
    'role-opt-card',
    selected ? 'role-opt-card--selected' : '',
    disabled ? 'role-opt-card--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      title={disabled ? 'Only Admins can invite members to this role' : undefined}
    >
      <div className="role-opt-card__left">
        {/* Custom accessible radio indicator */}
        <span
          className={`role-opt-radio ${selected ? 'role-opt-radio--checked' : ''} ${
            disabled ? 'role-opt-radio--disabled' : ''
          }`}
          aria-hidden="true"
        >
          {selected && <span className="role-opt-radio__inner" />}
        </span>

        <div className="role-opt-card__info">
          <span className="role-opt-card__title">{role.title || role.name}</span>
          <span className="role-opt-card__desc">{role.description}</span>
        </div>
      </div>

      <div className="role-opt-card__right">
        {selected ? (
          <span className="role-opt-badge role-opt-badge--selected">Selected</span>
        ) : disabled ? (
          <span className="role-opt-badge role-opt-badge--admin-only">Admin only</span>
        ) : null}
      </div>
    </div>
  );
}
