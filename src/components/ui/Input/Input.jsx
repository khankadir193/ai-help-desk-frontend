import styles from './Input.module.css';

export default function Input({
  label,
  id,
  type = 'text',
  error,
  helperText,
  rightElement,
  disabled = false,
  className = '',
  ...rest
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const inputClasses = [
    styles.input,
    error ? styles.hasError : '',
    rightElement ? styles.hasRightElement : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}

      <div className={styles.inputContainer}>
        <input
          id={inputId}
          type={type}
          disabled={disabled}
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

