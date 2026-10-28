import styles from './Input.module.css';

export default function Input({
  label,
  id,
  type = 'text',
  error,
  helperText,
  leftIcon,
  rightElement,
  disabled = false,
  required = false,
  className = '',
  ...rest
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const inputClasses = [
    styles.input,
    error ? styles.hasError : '',
    leftIcon ? styles.hasLeftIcon : '',
    rightElement ? styles.hasRightElement : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.wrapper}>
      {label && (
        <div className={styles.labelRow}>
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.requiredStar} aria-hidden="true">*</span>}
          </label>
        </div>
      )}

      <div className={styles.inputContainer}>
        {leftIcon && <div className={styles.leftIcon}>{leftIcon}</div>}

        <input
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          className={inputClasses}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...rest}
        />

        {rightElement && <div className={styles.rightElement}>{rightElement}</div>}
      </div>

      {error ? (
        <span id={`${inputId}-error`} className={styles.errorMessage} role="alert">
          <svg className={styles.errorIcon} viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </span>
      ) : helperText ? (
        <span id={`${inputId}-helper`} className={styles.helperText}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
}
