import { useAiPrioritySuggestion, useSuggestTicketPriority } from '../hooks/useTickets';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/Icon/Icon';
import StatusPill from '../../../components/StatusPill/StatusPill';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from './TicketAiClassification.module.css';

/**
 * AI Priority Suggestion card (AGENT assigned / ADMIN only — TicketDetails
 * renders it for staff, and the backend remains the source of truth).
 *
 * Backend contract (src/modules/ai):
 *  - POST /api/v1/tickets/:id/ai/priority, no request body.
 *  - The suggestion is stored with status PENDING and is advisory only: no
 *    accept/reject (review) endpoint exists yet, and the ticket's priority
 *    is never modified automatically (applying it is an explicit human
 *    action through the regular ticket update endpoint — docs/07).
 *  - result: { suggestedPriority (LOW|MEDIUM|HIGH|URGENT), currentPriority,
 *    confidence, reason } — validated and normalized server-side.
 *  - The result shown here comes from the POST response itself because the
 *    backend has no GET endpoint for suggestions; it is kept in the client
 *    cache instead of with the ticket.
 */

/** Presentation-only label map over the backend priority enums. */
const PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

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

export default function AiPrioritySuggestion({ ticket, ticketId }) {
  const { data } = useAiPrioritySuggestion(ticketId);
  const suggestion = data ?? null;
  const priorityMutation = useSuggestTicketPriority();

  const result = suggestion?.result ?? null;
  const suggestedPriority =
    typeof result?.suggestedPriority === 'string' && result.suggestedPriority
      ? result.suggestedPriority.toUpperCase()
      : null;
  const confidence = formatConfidence(result?.confidence);
  const reason =
    typeof result?.reason === 'string' ? result.reason.trim() : '';

  // Compare with the live ticket priority (both are uppercase enums).
  const matchesCurrent =
    suggestedPriority !== null &&
    typeof ticket?.priority === 'string' &&
    ticket.priority.toUpperCase() === suggestedPriority;

  const handleSuggest = () => {
    priorityMutation.mutate({ id: ticketId });
  };

  return (
    <div className={styles.card} aria-label="AI Priority Suggestion">
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Icon name="sparkle" size={15} className={styles.titleIcon} />
          <span>AI Priority Suggestion</span>
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
          onClick={handleSuggest}
          isLoading={priorityMutation.isPending}
        >
          <Icon name="sparkle" size={14} />
          <span>{suggestion ? 'Run Again' : 'Suggest Priority'}</span>
        </Button>
      </div>

      {priorityMutation.isError && !priorityMutation.isPending && (
        <div className={styles.errorBanner} role="alert">
          <div className={styles.errorLeft}>
            <Icon name="alert-circle" size={18} />
            <span>{getErrorMessage(priorityMutation.error)}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={handleSuggest}>
            Try Again
          </Button>
        </div>
      )}

      {priorityMutation.isPending && (
        <div className={styles.analyzing}>
          <Spinner size="sm" label="" />
          <span>Analyzing the ticket title and description…</span>
        </div>
      )}

      {!priorityMutation.isPending && !suggestion && (
        <p className={styles.hint}>
          Ask the AI to suggest a priority for this ticket. Suggestions are
          advisory only — the ticket priority is never changed automatically,
          and each result is stored for review.
        </p>
      )}

      {!priorityMutation.isPending && suggestion && (
        <div className={styles.suggestion}>
          <div className={styles.suggestionHead}>
            <span className={styles.suggestedLabel}>Suggested priority</span>
            {suggestedPriority ? (
              <StatusPill
                status={suggestedPriority}
                label={PRIORITY_LABELS[suggestedPriority] || suggestedPriority}
              />
            ) : (
              <span className={styles.suggestedName}>—</span>
            )}
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
                  Matches the current priority
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
              suggestion is stored as PENDING review and the priority is not
              updated automatically.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
