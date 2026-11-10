import { useState } from 'react';
import Icon from '../../../../components/Icon/Icon';
import './CategoryDetailsForm.css';

export default function CategoryDetailsForm({
  mode = 'edit',
  category,
  authors = [],
  onSave,
  onCancel,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
  isSaving = false,
  serverError = '',
}) {
  const isCreate = mode === 'create';

  const [formData, setFormData] = useState(() => ({
    name: category?.name || '',
    description: category?.description || '',
    owner_id: category?.owner_id || authors[0]?.id || '',
    icon: category?.icon || 'credit-card',
  }));
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Category name is required.');
      return;
    }
    setError('');
    onSave({
      id: category?.id,
      name: formData.name.trim(),
      description: formData.description.trim(),
      owner_id: formData.owner_id ? Number(formData.owner_id) : null,
      icon: formData.icon,
    });
  };

  const publishedCount = category?.published_count ?? category?.published ?? 0;
  const draftCount = category?.draft_count ?? 0;
  const inReviewCount = category?.in_review_count ?? 0;
  const archivedCount = category?.archived_count ?? 0;

  return (
    <div className="kb-cat-details-card">
      <h2 className="kb-cat-details-card__title">
        {isCreate ? 'Create category' : 'Category details'}
      </h2>

      <form onSubmit={handleSubmit} className="kb-cat-details-form" noValidate>
        {/* Category name */}
        <div className="kb-cat-field">
          <label htmlFor="kb-cat-name" className="kb-cat-field__label">
            Category name *
          </label>
          <input
            id="kb-cat-name"
            type="text"
            className={`kb-cat-field__input ${error ? 'kb-cat-field__input--error' : ''}`}
            placeholder="e.g. Billing & subscriptions"
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
              if (error) setError('');
            }}
            aria-required="true"
            aria-invalid={Boolean(error)}
          />
          {error && <span className="kb-cat-field__error">{error}</span>}
          {serverError && <span className="kb-cat-field__error">{serverError}</span>}
        </div>

        {/* Description */}
        <div className="kb-cat-field">
          <label htmlFor="kb-cat-desc" className="kb-cat-field__label">
            Description
          </label>
          <input
            id="kb-cat-desc"
            type="text"
            className="kb-cat-field__input"
            placeholder="e.g. Payments, invoices and refunds"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          />
          <span className="kb-cat-field__helper">Shown in the help center category card.</span>
        </div>

        {/* Category owner */}
        <div className="kb-cat-field">
          <label htmlFor="kb-cat-owner" className="kb-cat-field__label">
            Category owner
          </label>
          <div className="kb-cat-select-wrapper">
            <select
              id="kb-cat-owner"
              className="kb-cat-field__select"
              value={formData.owner_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, owner_id: e.target.value }))}
            >
              <option value="">Select owner...</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <Icon name="chevron-down" size={14} className="kb-cat-chevron" />
          </div>
        </div>

        {!isCreate && (
          <>
            {/* Help center visibility */}
            <div className="kb-cat-info-group">
              <span className="kb-cat-info-group__label">Help center visibility</span>
              <span className="kb-cat-info-group__value">
                Visible · {publishedCount} published articles
              </span>
            </div>

            {/* Other articles */}
            <div className="kb-cat-info-group">
              <span className="kb-cat-info-group__label">Other articles</span>
              <span className="kb-cat-info-group__value">
                {draftCount} draft · {inReviewCount} in review · {archivedCount} archived
              </span>
            </div>

            {/* Move up / Move down buttons */}
            <div className="kb-cat-reorder-row">
              <button
                type="button"
                className="kb-cat-reorder-btn"
                onClick={onMoveUp}
                disabled={isFirst}
                aria-label="Move category up"
              >
                Move up
              </button>
              <button
                type="button"
                className="kb-cat-reorder-btn"
                onClick={onMoveDown}
                disabled={isLast}
                aria-label="Move category down"
              >
                Move down
              </button>
            </div>

            {/* Delete notice */}
            <p className="kb-cat-delete-note">
              To delete this category, move its articles to another category first.
            </p>
          </>
        )}

        {/* Actions Row */}
        <div className="kb-cat-actions-row">
          <button
            type="button"
            className="kb-cat-btn kb-cat-btn--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="kb-cat-btn kb-cat-btn--primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : isCreate ? 'Create category' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
