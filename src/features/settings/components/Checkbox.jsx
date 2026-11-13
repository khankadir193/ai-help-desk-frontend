import Icon from '../../../components/Icon/Icon';
import './Checkbox.css';

export default function Checkbox({
  id,
  checked = false,
  onChange,
  disabled = false,
  ariaLabel,
  title,
  className = '',
}) {
  const handleChange = (e) => {
    if (disabled) return;
    onChange?.(e.target.checked);
  };

  return (
    <label
      className={`checkbox-wrapper ${disabled ? 'checkbox-wrapper--disabled' : ''} ${className}`.trim()}
      title={title}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        aria-label={ariaLabel}
        className="checkbox-input"
      />
      <span className={`checkbox-box ${checked ? 'checkbox-box--checked' : ''}`}>
        {checked && <Icon name="check" size={12} strokeWidth={3} className="checkbox-check" />}
      </span>
    </label>
  );
}

