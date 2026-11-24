import { useEffect, useRef } from 'react';
import Icon from '../../../components/Icon/Icon';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import { formatTicketId } from '../utils/ticketFormatters';
import './ConfirmDeleteDialog.css';

export default function ConfirmDeleteDialog({
  isOpen = false,
  ticketIds = [],
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  const dialogRef = useRef(null);
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus cancel button on open
    cancelBtnRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
      // Simple focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

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
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  const count = ticketIds.length;
  const isMultiple = count > 1;
  const title = isMultiple ? `Delete ${count} tickets?` : 'Delete ticket?';

  const ticketListText =
    count === 1
      ? formatTicketId(ticketIds[0])
      : count === 2
      ? `${formatTicketId(ticketIds[0])} and ${formatTicketId(ticketIds[1])}`
      : `${formatTicketId(ticketIds[0])}, ${formatTicketId(ticketIds[1])} and ${count - 2} more`;

  const description = `This permanently removes ${ticketListText} along with their conversations and attachments. This can't be undone.`;

  return (
    <div className="confirm-delete-overlay" role="presentation">
      <div
        className="confirm-delete-dialog"
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-desc"
      >
        <div className="confirm-delete-dialog__icon-wrapper" aria-hidden="true">
          <Icon name="trash" size={20} strokeWidth={2} />
        </div>

        <h2 id="delete-dialog-title" className="confirm-delete-dialog__title">
          {title}
        </h2>

        <p id="delete-dialog-desc" className="confirm-delete-dialog__desc">
          {description}
        </p>

        <div className="confirm-delete-dialog__actions">
          <button
            ref={cancelBtnRef}
            type="button"
            className="confirm-delete-dialog__btn confirm-delete-dialog__btn--cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="confirm-delete-dialog__btn confirm-delete-dialog__btn--delete"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Spinner size="sm" />}
            <span>{isMultiple ? 'Delete tickets' : 'Delete ticket'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
