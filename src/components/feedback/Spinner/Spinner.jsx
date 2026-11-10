import AppLoader from '../AppLoader/AppLoader';
import styles from './Spinner.module.css';

export default function Spinner({ size = 'md', fullPage = false, label = 'Loading...' }) {
  if (fullPage) {
    return <AppLoader message={label} />;
  }

  return (
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
    </div>
  );
}

