import { useAiClassification, useClassifyTicket } from '../hooks/useTickets';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/Icon/Icon';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from './TicketAiClassification.module.css';

/**
 * AI Ticket Classification card (AGENT assigned / ADMIN only — TicketDetails
 * renders it for staff, and the backend remains the source of truth).
 *
 * Backend contract (src/modules/ai):
 *  - POST /api/v1/tickets/:id/ai/classify, no request body.
 *  - The suggestion is stored with status PENDING and is advisory only: no
 *    accept/reject (review) endpoint exists yet, and the ticket category is
 *    never modified automatically.
 *  - The result shown here comes from the classify response itself because
 *    the backend has no GET endpoint for suggestions; it is therefore kept
 *    in the client cache instead of with the ticket.
 */
const formatConfidence = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.round(value * 100);
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return dateStr;
  }
};

export default function TicketAiClassification({ ticket, ticketId }) {
  const { data } = useAiClassification(ticketId);
  const suggestion = data ?? null;
  const classifyMutation = useClassifyTicket();

  const result = suggestion?.result ?? null;
  const suggestedName = result?.suggestedCategory || null;
  const confidence = formatConfidence(result?.confidence);
  const reason =
    typeof result?.reason === 'string' ? result.reason.trim() : '';

  // IDs are stringified BIGINTs from the pg driver, so compare as strings.
  const suggestedCategoryId = result?.suggestedCategoryId;
  const currentCategoryId =
    ticket?.category_id ?? ticket?.category?.id ?? null;
  const matchesCurrent =
    suggestedCategoryId != null &&
    currentCategoryId != null &&
    String(suggestedCategoryId) === String(currentCategoryId);

  const handleClassify = () => {
    classifyMutation.mutate({ id: ticketId });
  };

  return (
    <div className={styles.card} aria-label="AI Category Suggestion">
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Icon name="sparkle" size={15} className={styles.titleIcon} />
          <span>AI Category Suggestion</span>
          {suggestion?.status && (
            <span
              className={styles.pendingBadge}
              title="This suggestion is pending review"
            >
              {suggestion.status}
            </span>
          )}
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleClassify}
          isLoading={classifyMutation.isPending}
        >
          <Icon name="sparkle" size={14} />
          <span>{suggestion ? 'Run Again' : 'Classify with AI'}</span>
        </Button>
      </div>

      {classifyMutation.isError && !classifyMutation.isPending && (
        <div className={styles.errorBanner} role="alert">
          <div className={styles.errorLeft}>
            <Icon name="alert-circle" size={18} />
            <span>{getErrorMessage(classifyMutation.error)}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={handleClassify}>
            Try Again
          </Button>
        </div>
      )}

      {classifyMutation.isPending && (
        <div className={styles.analyzing}>
          <Spinner size="sm" label="" />
          <span>Analyzing the ticket title and description…</span>
        </div>
      )}

      {!classifyMutation.isPending && !suggestion && (
        <p className={styles.hint}>
          Ask the AI to suggest a category for this ticket. Suggestions are
          advisory only — the ticket category is never changed automatically,
          and each result is stored for review.
        </p>
      )}

      {!classifyMutation.isPending && suggestion && (
        <div className={styles.suggestion}>
          <div className={styles.suggestionHead}>
            <span className={styles.suggestedLabel}>Suggested category</span>
            <span className={styles.suggestedName}>
              {suggestedName || '—'}
            </span>
          </div>

          {(confidence !== null || matchesCurrent) && (
            <div className={styles.suggestionChips}>
              {confidence !== null && (
                <span className={styles.confidenceChip}>
                  Confidence {confidence}%
                </span>
              )}
              {matchesCurrent && (
                <span className={styles.matchChip}>
                  Matches the current category
                </span>
              )}
            </div>
          )}

          {reason && <p className={styles.reason}>{reason}</p>}

          <p className={styles.meta}>
            {suggestion.provider || 'AI'} · {suggestion.model_name || 'unknown model'} ·{' '}
            {formatDate(suggestion.created_at) || 'just now'}
          </p>

          <p className={styles.advisory}>
            <Icon name="alert-circle" size={14} />
            <span>
              Advisory only — nothing on this ticket was changed. The
              suggestion is stored as PENDING review and the category is not
              updated automatically.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
