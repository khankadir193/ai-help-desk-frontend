import { useEffect } from 'react';
import Icon from '../../../components/Icon/Icon';
import styles from './Toast.module.css';

export default function Toast({ message, type = 'info', onDismiss, duration = 4000 }) {
  useEffect(() => {
    if (!duration || !onDismiss) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const typeClass =
    type === 'success'
      ? styles.toastSuccess
      : type === 'error'
      ? styles.toastError
      : styles.toastInfo;

  return (
    <div className={`${styles.toastContainer} ${typeClass}`} role="status" aria-live="polite">
      <span className={styles.toastMessage}>{message}</span>
      {onDismiss && (
        <button
          type="button"
          className={styles.dismissBtn}
          onClick={onDismiss}
          aria-label="Dismiss message"
        >
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
}
