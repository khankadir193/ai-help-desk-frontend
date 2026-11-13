import './Toggle.css';

export default function Toggle({
  id,
  checked = false,
  onChange,
  disabled = false,
  ariaLabel,
  className = '',
}) {
  const handleToggle = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange?.(!checked);
    }
  };

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`toggle-switch ${checked ? 'toggle-switch--checked' : ''} ${className}`.trim()}
    >
      <span className="toggle-switch__knob" aria-hidden="true" />
    </button>
  );
}

