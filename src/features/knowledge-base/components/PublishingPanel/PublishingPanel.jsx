import StatusBadge from '../StatusBadge/StatusBadge';
import Icon from '../../../../components/Icon/Icon';
import './PublishingPanel.css';

export default function PublishingPanel({
  status = 'DRAFT',
  categories = [],
  selectedCategory = '',
  onCategoryChange,
  categoryError = '',
  visibility = 'PUBLIC',
  onVisibilityChange,
  tags = '',
  onTagsChange,
  ownerName = 'Maya Chen',
}) {
  return (
    <div className="kb-publishing-panel">
      <h3 className="kb-publishing-panel__title">Publishing</h3>

      {/* Status Badge */}
      <div className="kb-publishing-panel__badge-row">
        <StatusBadge status={status} />
      </div>

      {/* Category Dropdown */}
      <div className="kb-publishing-panel__field">
        <label htmlFor="kb-editor-category" className="kb-publishing-panel__label">
          Category *
        </label>
        <div className="kb-publishing-panel__select-wrapper">
          <select
            id="kb-editor-category"
            className={`kb-publishing-panel__select ${categoryError ? 'kb-publishing-panel__select--error' : ''}`}
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-required="true"
            aria-invalid={Boolean(categoryError)}
          >
            <option value="">Select category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Icon name="chevron-down" size={14} className="kb-publishing-panel__chevron" />
        </div>
        {categoryError && <span className="kb-publishing-panel__error">{categoryError}</span>}
      </div>

      {/* Visibility Dropdown */}
      <div className="kb-publishing-panel__field">
        <label htmlFor="kb-editor-visibility" className="kb-publishing-panel__label">
          Visibility
        </label>
        <div className="kb-publishing-panel__select-wrapper">
          <select
            id="kb-editor-visibility"
            className="kb-publishing-panel__select"
            value={visibility}
            onChange={(e) => onVisibilityChange(e.target.value)}
          >
            <option value="PUBLIC">Public help center</option>
            <option value="INTERNAL">Internal workspace only</option>
          </select>
          <Icon name="chevron-down" size={14} className="kb-publishing-panel__chevron" />
        </div>
      </div>

      {/* Tags Input */}
      <div className="kb-publishing-panel__field">
        <label htmlFor="kb-editor-tags" className="kb-publishing-panel__label">
          Tags
        </label>
        <input
          id="kb-editor-tags"
          type="text"
          className="kb-publishing-panel__input"
          placeholder="e.g. 2fa, recovery"
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
        />
      </div>

      {/* Article Owner */}
      <div className="kb-publishing-panel__owner">
        <span className="kb-publishing-panel__owner-label">Article owner</span>
        <span className="kb-publishing-panel__owner-name">{ownerName}</span>
      </div>

      {/* Notice */}
      <p className="kb-publishing-panel__notice">
        Only published articles appear in the help center. Review before publishing.
      </p>
    </div>
  );
}

