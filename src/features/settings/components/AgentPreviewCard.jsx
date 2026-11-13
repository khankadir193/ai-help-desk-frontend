import Icon from '../../../components/Icon/Icon';
import './AgentPreviewCard.css';

export default function AgentPreviewCard({
  previewText,
  isLoading = false,
  onRefresh,
  disabled = false,
}) {
  const fallbackText =
    'Hi Sarah, thanks for reaching out. You can download your invoice from Settings → Billing. Let me know if you need help finding it.';

  const displayText = previewText || fallbackText;

  return (
    <div className="agent-preview-wrapper">
      <h3 className="agent-preview-wrapper__heading">What your agents will see</h3>

      <div className={`agent-preview-card ${disabled ? 'agent-preview-card--disabled' : ''}`}>
        <div className="agent-preview-card__header">
          <div className="agent-preview-card__title-group">
            <Icon name="sparkle" size={16} className="agent-preview-card__sparkle" />
            <span className="agent-preview-card__title">Suggested reply</span>
          </div>
          <span className="agent-preview-card__pill">AI-generated</span>
        </div>

        <div className="agent-preview-card__bubble">
          {isLoading ? (
            <div className="agent-preview-card__skeleton settings-skeleton" />
          ) : (
            <p className="agent-preview-card__text">{displayText}</p>
          )}
        </div>

        <div className="agent-preview-card__footer">
          <span className="agent-preview-card__review-note">
            AI-generated · Human review required. Never auto-sent.
          </span>

          <div className="agent-preview-card__actions">
            <button
              type="button"
              className="agent-preview-card__btn-action"
              disabled
              title="Preview only"
            >
              Insert into reply
            </button>
            <button
              type="button"
              className="agent-preview-card__btn-action"
              disabled
              title="Preview only"
            >
              Copy
            </button>
            <button
              type="button"
              className="agent-preview-card__btn-refresh"
              onClick={onRefresh}
              disabled={disabled || isLoading}
              aria-label="Refresh preview"
              title="Refresh sample preview"
            >
              <Icon
                name="refresh"
                size={14}
                className={isLoading ? 'agent-preview-card__spin' : ''}
              />
            </button>
          </div>
        </div>
      </div>

      <p className="settings-muted-note agent-preview-wrapper__note">
        Example only · Inserting a draft does not send it.
      </p>
    </div>
  );
}

