import './FormField.css';

export default function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  helperText,
  error,
  disabled = false,
  readOnly = false,
  required = false,
  suffix,
  className = '',
  autoComplete,
}) {
  const inputId = id || `field-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`form-field ${error ? 'form-field--error' : ''} ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="form-field__label">
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}

      <div className="form-field__input-wrapper">
        <input
          id={inputId}
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={() => onBlur?.()}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          className="form-field__input"
        />
        {suffix && <div className="form-field__suffix">{suffix}</div>}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="form-field__error-text" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="form-field__helper-text">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

