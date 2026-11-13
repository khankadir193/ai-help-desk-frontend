import Modal from '../../../components/ui/Modal/Modal';
import './DiscardChangesModal.css';

export default function DiscardChangesModal({
  isOpen,
  onStay,
  onDiscard,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onStay}
      title="Unsaved changes"
      description="You have unsaved changes in this tab. If you leave now, your changes will be discarded."
      size="sm"
      footer={
        <div className="discard-modal__actions">
          <button
            type="button"
            className="discard-modal__btn-stay"
            onClick={onStay}
            autoFocus
          >
            Stay
          </button>
          <button
            type="button"
            className="discard-modal__btn-discard"
            onClick={onDiscard}
          >
            Discard changes
          </button>
        </div>
      }
    >
      <p className="discard-modal__message">
        Are you sure you want to discard your edits? This action cannot be undone.
      </p>
    </Modal>
  );
}

