import styles from './Spinner.module.css';

export default function Spinner({ size = 'md', fullPage = false, label = 'Loading...' }) {
  const spinnerElement = (
    <div
      className={styles.spinnerContainer}
      role="status"
      aria-label={label}
    >
      <svg
        className={`${styles.spinner} ${styles[size]}`}
        viewBox="0 0 50 50"
        aria-hidden="true"
      >
        <circle
          className={styles.spinnerCircle}
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="5"
        />
      </svg>
      <span className="sr-only" style={{ display: 'none' }}>{label}</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className={styles.fullPage}>
        {spinnerElement}
        {label && <p className={styles.label}>{label}</p>}
      </div>
    );
  }

  return spinnerElement;
}

