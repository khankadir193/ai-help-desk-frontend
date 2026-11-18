import './ProtectWorkspaceCard.css';

export default function ProtectWorkspaceCard({
  canEdit = false,
  isDirty = false,
  isSaving = false,
  onRequestAccess,
  onSave,
  onReset,
}) {
  const statusText = !canEdit
    ? 'System policies · Enforced by backend authorization'
    : isDirty
      ? 'Unsaved changes apply only after you save'
      : 'No unsaved changes';

  return (
    <section className="protect-card" aria-label="Protect your workspace">
      <h2 className="protect-card__title">Protect your workspace</h2>
      <p className="protect-card__body">
        {canEdit
          ? 'Saved permissions take effect for every existing and newly created user with that role — across all Admin accounts. At least one Admin must remain active.'
          : 'Role-based permissions are enforced at the API layer. At least one workspace Admin must remain active.'}
      </p>

      <div className="protect-card__footer">
        <div className="protect-card__status" aria-live="polite">
          {canEdit && isDirty && (
            <span className="protect-card__dirty-dot" aria-hidden="true" />
          )}
          <span className="protect-card__status-text">{statusText}</span>
        </div>

        <div className="protect-card__actions">
          {canEdit ? (
            <>
              <button
                type="button"
                className="protect-btn-request"
                disabled={!isDirty || isSaving}
                onClick={onReset}
              >
                Discard changes
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
            </>
          ) : (
            <button
              type="button"
              className="protect-btn-request"
              onClick={onRequestAccess}
            >
              Request access change
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
