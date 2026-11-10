import RichTextEditor from '../RichTextEditor/RichTextEditor';
import './ArticleEditorForm.css';

export default function ArticleEditorForm({
  mode = 'create',
  initialArticle,
  formData,
  errors = {},
  onChange,
  lastSavedAt,
  onOpenPreview,
}) {
  const isEdit = mode === 'edit';
  const showBanner = isEdit && (initialArticle?.status === 'PUBLISHED' || initialArticle?.has_draft_revision);
  const draftVer = initialArticle?.draft_version || (initialArticle?.published_version ? initialArticle.published_version + 1 : 1);
  const pubVer = initialArticle?.published_version || 1;

  return (
    <div className="kb-editor-form-card">
      {/* Revision Banner in Edit Mode */}
      {showBanner && (
        <div className="kb-revision-banner" role="status">
          <p className="kb-revision-banner__text">
            Editing draft version {draftVer}. Published version {pubVer} stays live until you publish changes.
          </p>
        </div>
      )}

      {/* Article Title */}
      <div className="kb-form-field">
        <label htmlFor="kb-article-title" className="kb-form-field__label">
          Article title *
        </label>
        <input
          id="kb-article-title"
          type="text"
          className={`kb-form-field__input ${errors.title ? 'kb-form-field__input--error' : ''}`}
          placeholder="e.g. Recover access after losing your 2FA device"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          aria-required="true"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'kb-title-error' : undefined}
        />
        {errors.title && (
          <span id="kb-title-error" className="kb-form-field__error">
            {errors.title}
          </span>
        )}
      </div>

      {/* Summary */}
      <div className="kb-form-field">
        <label htmlFor="kb-article-summary" className="kb-form-field__label">
          Summary
        </label>
        <input
          id="kb-article-summary"
          type="text"
          className="kb-form-field__input"
          placeholder="Brief summary shown in search results and cards..."
          value={formData.summary}
          onChange={(e) => onChange('summary', e.target.value)}
        />
      </div>

      {/* Rich Text Editor */}
      <div className="kb-form-field">
        <RichTextEditor
          value={formData.content}
          onChange={(content) => onChange('content', content)}
          placeholder="Write your article content here..."
        />
      </div>

      {/* Editor Sub-Footer */}
      <div className="kb-editor-subfooter">
        <div className="kb-editor-subfooter__status" aria-live="polite">
          {lastSavedAt ? `Draft saved at ${lastSavedAt} · Not published` : 'Not published'}
        </div>
        <button
          type="button"
          className="kb-preview-btn"
          onClick={onOpenPreview}
          aria-label="Preview article"
        >
          Preview
        </button>
      </div>
    </div>
  );
}

