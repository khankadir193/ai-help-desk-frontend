import { useEffect, useState } from 'react';
import { useAiReplyDraft, useGenerateReplyDraft } from '../hooks/useTickets';
import Icon from '../../../components/Icon/Icon';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import styles from './AiReplyDraft.module.css';

export default function AiReplyDraft({ ticket, onUseDraft }) {
  const ticketId = ticket?.id;
  const { data: draftData } = useAiReplyDraft(ticketId);
  const generateDraftMutation = useGenerateReplyDraft();

  const [copied, setCopied] = useState(false);

  // Auto-generate draft on first load if not present
  useEffect(() => {
    if (ticketId && !draftData && !generateDraftMutation.isPending && !generateDraftMutation.isSuccess) {
      generateDraftMutation.mutate({ id: ticketId });
    }
  }, [ticketId]); // eslint-disable-line react-hooks/exhaustive-deps

  const isPending = generateDraftMutation.isPending;
  const draftText =
    draftData?.result?.draft ||
    `Hi ${ticket?.customer_name ? ticket.customer_name.split(' ')[0] : 'there'}, thanks for reaching out. We are reviewing your request regarding "${ticket?.title || 'your issue'}" and will follow up shortly with resolution steps.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draftText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleReviewDraft = () => {
    onUseDraft?.(draftText);
  };

  return (
    <div className={styles.card} aria-label="AI reply draft">
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Icon name="sparkle" size={15} className={styles.sparkleIcon} />
          <h3 className={styles.title}>AI reply draft</h3>
        </div>
        <span className={styles.aiBadge}>AI-generated</span>
      </div>

      <div className={styles.draftBox}>
        {isPending ? (
          <div className={styles.loadingState}>
            <Spinner size="sm" />
            <span>Generating draft reply...</span>
          </div>
        ) : (
          <p className={styles.draftText}>{draftText}</p>
        )}
      </div>

      <p className={styles.disclaimer}>
        AI-generated · Verify billing facts before sending. Never auto-sent.
      </p>

      <div className={styles.actionsRow}>
        <button
          type="button"
          className={styles.reviewBtn}
          onClick={handleReviewDraft}
          disabled={isPending || !draftText}
        >
          Review draft
        </button>
        <button
          type="button"
          className={styles.copyBtn}
          onClick={handleCopy}
          disabled={isPending || !draftText}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
