import './ProtectWorkspaceCard.css';

export default function ProtectWorkspaceCard({
  canEdit = false,
  isDirty = false,
  isSaving = false,
  onRequestAccess,
  onSave,
}) {
  const statusText = !canEdit
    ? 'No unsaved changes · Editing requires Admin access'
    : isDirty
      ? 'Unsaved changes'
      : 'No unsaved changes';

  return (
    <section className="protect-card" aria-label="Protect your workspace">
      <h2 className="protect-card__title">Protect your workspace</h2>
      <p className="protect-card__body">
        At least one Admin must remain. Permission updates require an Admin review and explicit confirmation before they apply.
      </p>

      <div className="protect-card__footer">
        <div className="protect-card__status" aria-live="polite">
          {canEdit && isDirty && (
            <span className="protect-card__dirty-dot" aria-hidden="true" />
          )}
          <span className="protect-card__status-text">{statusText}</span>
        </div>

        <div className="protect-card__actions">
          <button
            type="button"
            className="protect-btn-request"
            onClick={onRequestAccess}
          >
            Request access change
          </button>

          <button
            type="button"
            className={`protect-btn-save ${
              canEdit && isDirty ? 'protect-btn-save--active' : 'protect-btn-save--disabled'
            }`}
            disabled={!canEdit || !isDirty || isSaving}
            onClick={onSave}
          >
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </section>
  );
}
