import { useState, useRef } from 'react';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import styles from './AiComposer.module.css';

/**
 * AI Assistant reply and internal note composer.
 *
 * Rules:
 * - AI suggestions are never sent automatically.
 * - Inserting a draft only populates the textarea; it never submits or auto-checks the review box.
 * - Sending requires explicit human confirmation (non-empty text + verified review checkbox).
 */
export default function AiComposer({
  ticket,
  customerEmail: propCustomerEmail,
  composerText = '',
  onComposerTextChange,
  aiState = 'ready',
  onSendReply,
  isSending = false,
  textareaRef,
}) {
  const [activeTab, setActiveTab] = useState('reply'); // 'reply' | 'note'
  const [isReviewed, setIsReviewed] = useState(false);
  const tabReplyRef = useRef(null);
  const tabNoteRef = useRef(null);

  const customerEmail = propCustomerEmail || ticket?.customer?.email || ticket?.customer_email || 'sarah.johnson@example.com';

  // State-specific placeholder
  const placeholder =
    aiState === 'ready'
      ? 'Insert the AI draft above, or write your own reply...'
      : 'Write your reply here. AI is not required...';

  const canSubmit = Boolean(composerText.trim()) && isReviewed && !isSending;

  // Arrow key navigation between tabs (accessibility tablist pattern)
  const handleKeyDownTab = (e, targetTab) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextTab = targetTab === 'reply' ? 'note' : 'reply';
      setActiveTab(nextTab);
      if (nextTab === 'reply') tabReplyRef.current?.focus();
      else tabNoteRef.current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || isSending) return;

    const isInternal = activeTab === 'note';
    const success = await onSendReply(composerText.trim(), isInternal, isReviewed);
    if (success) {
      setIsReviewed(false);
    }
  };

  return (
    <div className={styles.composerCard} aria-label="Reply composer">
      {/* Accessible Tabs */}
      <div className={styles.tabsList} role="tablist" aria-label="Composer modes">
        <button
          ref={tabReplyRef}
          type="button"
          role="tab"
          id="tab-reply"
          aria-selected={activeTab === 'reply'}
          aria-controls="panel-composer"
          tabIndex={activeTab === 'reply' ? 0 : -1}
          className={`${styles.tabBtn} ${activeTab === 'reply' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('reply')}
          onKeyDown={(e) => handleKeyDownTab(e, 'reply')}
        >
          Reply to customer
        </button>

        <button
          ref={tabNoteRef}
          type="button"
          role="tab"
          id="tab-note"
          aria-selected={activeTab === 'note'}
          aria-controls="panel-composer"
          tabIndex={activeTab === 'note' ? 0 : -1}
          className={`${styles.tabBtn} ${activeTab === 'note' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('note')}
          onKeyDown={(e) => handleKeyDownTab(e, 'note')}
        >
          Internal note
        </button>
      </div>

      <form
        id="panel-composer"
        role="tabpanel"
        aria-labelledby={activeTab === 'reply' ? 'tab-reply' : 'tab-note'}
        onSubmit={handleSubmit}
        className={styles.inputGroup}
        noValidate
      >
        <div className={styles.labelRow}>
          <label htmlFor="ai-composer-textarea" className={styles.fieldLabel}>
            Your reply · editable
          </label>
        </div>

        <textarea
          id="ai-composer-textarea"
          ref={textareaRef}
          className={styles.textarea}
          rows={3}
          value={composerText}
          onChange={(e) => onComposerTextChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={isSending}
        />

        <div className={styles.metaRow}>
          <div className={styles.recipientText}>
            To: {customerEmail} · {activeTab === 'reply' ? 'Public reply' : 'Private note'}
          </div>

          <label className={styles.checkboxLabel} htmlFor="ai-review-checkbox">
            <input
              id="ai-review-checkbox"
              type="checkbox"
              className={styles.checkboxInput}
              checked={isReviewed}
              onChange={(e) => setIsReviewed(e.target.checked)}
              disabled={isSending}
            />
            <span>
              I've reviewed the reply and verified the billing facts.
            </span>
          </label>
        </div>

        <div className={styles.composerFooter}>
          <span className={styles.footerStatus}>
            Not sent · Review required to send
          </span>

          <button
            type="submit"
            className={styles.sendBtn}
            disabled={!canSubmit}
            aria-busy={isSending}
          >
            {isSending ? (
              <>
                <Spinner size="xs" label="" />
                <span>Sending...</span>
              </>
            ) : (
              <span>Send reply</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
