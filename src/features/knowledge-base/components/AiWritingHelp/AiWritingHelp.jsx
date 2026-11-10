import { useState } from 'react';
import Icon from '../../../../components/Icon/Icon';
import Modal from '../../../../components/ui/Modal/Modal';
import Button from '../../../../components/ui/Button/Button';
import './AiWritingHelp.css';

export default function AiWritingHelp({
  suggestion = 'Remind readers to save new backup codes after recovery.',
  onInsertSuggestion,
  isLoading = false,
}) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (isDismissed) {
    return (
      <div className="kb-ai-card kb-ai-card--dismissed">
        <button
          type="button"
          className="kb-ai-reopen-btn"
          onClick={() => setIsDismissed(false)}
        >
          <Icon name="sparkle" size={14} className="kb-ai-icon" />
          <span>Show AI writing help</span>
        </button>
      </div>
    );
  }

  const handleInsert = () => {
    onInsertSuggestion?.(suggestion);
    setIsPreviewOpen(false);
  };

  return (
    <>
      <div className="kb-ai-card">
        {/* Header */}
        <div className="kb-ai-card__header">
          <div className="kb-ai-card__title-group">
            <Icon name="sparkle" size={16} className="kb-ai-icon" />
            <span className="kb-ai-card__title">AI writing help</span>
          </div>
          <span className="kb-ai-pill">AI-generated</span>
        </div>

        {/* Suggestion Bubble */}
        <div className="kb-ai-bubble">
          {isLoading ? (
            <p className="kb-ai-bubble__loading">Generating writing recommendation...</p>
          ) : (
            <p className="kb-ai-bubble__text">
              <strong>AI suggestion:</strong> {suggestion}
            </p>
          )}
        </div>

        {/* Notice */}
        <p className="kb-ai-card__notice">
          AI-generated · Review before inserting. Never auto-published.
        </p>

        {/* Action Buttons */}
        <div className="kb-ai-card__actions">
          <button
            type="button"
            className="kb-ai-btn kb-ai-btn--primary"
            onClick={() => setIsPreviewOpen(true)}
            disabled={isLoading || !suggestion}
          >
            Review suggestion
          </button>
          <button
            type="button"
            className="kb-ai-btn kb-ai-btn--secondary"
            onClick={() => setIsDismissed(true)}
          >
            Dismiss
          </button>
        </div>
      </div>

      {/* Review Modal */}
      {isPreviewOpen && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="Review AI Writing Suggestion"
          maxWidth="540px"
        >
          <div className="kb-ai-modal-body">
            <div className="kb-ai-modal-callout">
              <span className="kb-ai-modal-badge">Recommended Addition</span>
              <p className="kb-ai-modal-text">{suggestion}</p>
            </div>
            <p className="kb-ai-modal-help">
              Inserting this suggestion will append it as a tip or guideline to your article draft. You can edit or format it freely before publishing.
            </p>
            <div className="kb-ai-modal-actions">
              <Button
                variant="secondary"
                onClick={() => setIsPreviewOpen(false)}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                onClick={handleInsert}
              >
                Insert suggestion
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
