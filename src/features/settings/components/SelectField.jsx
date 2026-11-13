import Icon from '../../../components/Icon/Icon';
import './SelectField.css';

export default function SelectField({
  id,
  label,
  value,
  onChange,
  onBlur,
  options = [],
  helperText,
  error,
  disabled = false,
  required = false,
  className = '',
}) {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`select-field ${error ? 'select-field--error' : ''} ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="select-field__label">
          {label}
          {required && <span className="select-field__required">*</span>}
        </label>
      )}

      <div className="select-field__wrapper">
        <select
          id={selectId}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={() => onBlur?.()}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${selectId}-error`
              : helperText
              ? `${selectId}-helper`
              : undefined
          }
          className="select-field__select"
        >
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        <Icon name="chevron-down" size={16} className="select-field__chevron" />
      </div>

      {error ? (
        <p id={`${selectId}-error`} className="select-field__error-text" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${selectId}-helper`} className="select-field__helper-text">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

