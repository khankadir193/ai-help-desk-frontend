import Icon from '../../../components/Icon/Icon';
import './SettingsSaveBar.css';

export default function SettingsSaveBar({
  isDirty = false,
  isSaving = false,
  saveError = null,
  onSave,
  onCancel,
  disabled = false,
}) {
  return (
    <aside
      className="settings-save-bar"
      aria-label="Settings action bar"
      aria-live="polite"
    >
      <div className="settings-save-bar__status">
        {saveError ? (
          <div className="settings-save-bar__msg settings-save-bar__msg--error">
            <Icon name="alert-circle" size={16} className="settings-save-bar__icon-error" />
            <span className="settings-save-bar__label-error">Error saving changes</span>
            <span className="settings-save-bar__subtext">{saveError}</span>
          </div>
        ) : isDirty ? (
          <div className="settings-save-bar__msg">
            <span className="settings-save-bar__dot-amber" aria-hidden="true" />
            <span className="settings-save-bar__label-amber">Unsaved changes</span>
            <span className="settings-save-bar__subtext">Changes apply after you save.</span>
          </div>
        ) : (
          <div className="settings-save-bar__msg">
            <Icon name="check" size={16} strokeWidth={2.5} className="settings-save-bar__icon-green" />
            <span className="settings-save-bar__label-green">All changes saved</span>
            <span className="settings-save-bar__subtext">No unsaved changes</span>
          </div>
        )}
      </div>

      <div className="settings-save-bar__actions">
        <button
          type="button"
          className="settings-save-bar__btn-cancel"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`settings-save-bar__btn-save ${
            isDirty && !isSaving ? 'settings-save-bar__btn-save--active' : ''
          }`}
          onClick={onSave}
          disabled={!isDirty || isSaving || disabled}
          aria-busy={isSaving}
        >
          {isSaving ? (
            <span className="settings-save-bar__spinner-wrapper">
              <span className="settings-save-bar__spinner" aria-hidden="true" />
              <span>Saving...</span>
            </span>
          ) : (
            <span>Save changes</span>
          )}
        </button>
      </div>
    </aside>
  );
}
