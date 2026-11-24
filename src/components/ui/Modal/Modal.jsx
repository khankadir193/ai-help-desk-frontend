import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../Icon/Icon';
import styles from './Modal.module.css';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}) {
  const modalRef = useRef(null);
  const previouslyFocused = useRef(null);

  // Close on Escape, trap Tab focus & lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    // Move focus into the dialog and remember the trigger to restore it
    previouslyFocused.current = document.activeElement;
    const modal = modalRef.current;
    if (modal) {
      const focusable = modal.querySelectorAll(FOCUSABLE_SELECTOR);
      (focusable[0] || modal).focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // Keep Tab focus inside the dialog
      if (e.key === 'Tab' && modalRef.current) {
        const items = modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      // Restore focus to the element that opened the dialog
      const trigger = previouslyFocused.current;
      if (trigger && typeof trigger.focus === 'function') {
        trigger.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass =
    size === 'sm'
      ? styles.modalSm
      : size === 'lg'
      ? styles.modalLg
      : size === 'xl'
      ? styles.modalXl
      : '';

  const modalContent = (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        className={`${styles.modal} ${sizeClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        ref={modalRef}
        tabIndex={-1}
      >
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            {title && (
              <h2 id="modal-title" className={styles.title}>
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-description" className={styles.description}>
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <Icon name="x" size={18} strokeWidth={2} />
          </button>
        </div>

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

