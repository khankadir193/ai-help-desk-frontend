import { useAiSummary, useGenerateSummary } from '../hooks/useTickets';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/Icon/Icon';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from './TicketAiClassification.module.css';

/**
 * AI Conversation Summary card (AGENT assigned / ADMIN only — TicketDetails
 * renders it for staff, and the backend remains the source of truth).
 *
 * Backend contract (src/modules/ai):
 *  - POST /api/v1/tickets/:id/ai/summary, no request body. The summary is
 *    stored with status PENDING and is informational only: it never modifies
 *    the ticket (status, priority, category, assignment) and creates no
 *    comment automatically.
 *  - result fields (only what the backend returns):
 *      mainIssue (string), details (string[]), troubleshootingDone (string[]),
 *      currentStatus (string), nextSteps (string[]), ticketStatus (the
 *      ticket's actual status at request time — server-side fact, not AI
 *      output — exposed so the model's narrative can be cross-checked).
 *  - An empty/invalid/rejected AI response never reaches the client as data;
 *    it is a 502 error with a message (rendered in the error banner).
 *  - The result comes from the POST response itself (no GET endpoint); it is
 *    kept in the client cache and is rendered read-only.
 */

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

/** Summarised list section, rendered only when the backend returned items. */
function SummaryList({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <ul className={styles.summaryList}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export default function AiConversationSummary({ ticketId }) {
  const { data } = useAiSummary(ticketId);
  const suggestion = data ?? null;
  const summaryMutation = useGenerateSummary();

  const result = suggestion?.result ?? null;
  const mainIssue =
    typeof result?.mainIssue === 'string' ? result.mainIssue : '';
  const currentStatus =
    typeof result?.currentStatus === 'string' ? result.currentStatus : '';
  const ticketStatus =
    typeof result?.ticketStatus === 'string' ? result.ticketStatus : '';
  const details = Array.isArray(result?.details) ? result.details : [];
  const troubleshootingDone = Array.isArray(result?.troubleshootingDone)
    ? result.troubleshootingDone
    : [];
  const nextSteps = Array.isArray(result?.nextSteps) ? result.nextSteps : [];
  const hasContent = Boolean(
    mainIssue ||
      currentStatus ||
      details.length ||
      troubleshootingDone.length ||
      nextSteps.length,
  );

  const isPending = summaryMutation.isPending;

  return (
    <div className={styles.card} aria-label="AI Conversation Summary">
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Icon name="sparkle" size={15} className={styles.titleIcon} />
          <span>AI Conversation Summary</span>
          {suggestion?.status && (
            <span
              className={styles.pendingBadge}
              title="This summary is pending review"
            >
              {suggestion.status}
            </span>
          )}
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => summaryMutation.mutate({ id: ticketId })}
          isLoading={isPending}
        >
          <Icon name="sparkle" size={14} />
          <span>{suggestion ? 'Run Again' : 'Generate Summary'}</span>
        </Button>
      </div>

      {summaryMutation.isError && !isPending && (
        <div className={styles.errorBanner} role="alert">
          <div className={styles.errorLeft}>
            <Icon name="alert-circle" size={18} />
            <span>{getErrorMessage(summaryMutation.error)}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => summaryMutation.mutate({ id: ticketId })}
          >
            Try Again
          </Button>
        </div>
      )}

      {isPending && (
        <div className={styles.analyzing}>
          <Spinner size="sm" label="" />
          <span>Summarizing the ticket and conversation…</span>
        </div>
      )}

      {!isPending && !suggestion && (
        <p className={styles.hint}>
          Let the AI summarize this ticket and conversation at a glance.
          Summaries are advisory only — information for the support team;
          nothing on the ticket is ever changed.
        </p>
      )}

      {!isPending && suggestion && !hasContent && (
        <p className={styles.draftEmpty}>
          The AI returned an empty summary. Use Run Again to try once more.
        </p>
      )}

      {!isPending && suggestion && hasContent && (
        <div className={styles.suggestion}>
          {mainIssue && (
            <div className={styles.summaryBlock}>
              <span className={styles.suggestedLabel}>Main issue</span>
              <p className={styles.summaryText}>{mainIssue}</p>
            </div>
          )}

          {details.length > 0 && (
            <div className={styles.summaryBlock}>
              <span className={styles.suggestedLabel}>Details</span>
              <SummaryList items={details} />
            </div>
          )}

          {troubleshootingDone.length > 0 && (
            <div className={styles.summaryBlock}>
              <span className={styles.suggestedLabel}>
                Troubleshooting done
              </span>
              <SummaryList items={troubleshootingDone} />
            </div>
          )}

          {currentStatus && (
            <div className={styles.summaryBlock}>
              <span className={styles.suggestedLabel}>Current status</span>
              <p className={styles.summaryText}>{currentStatus}</p>
            </div>
          )}

          {nextSteps.length > 0 && (
            <div className={styles.summaryBlock}>
              <span className={styles.suggestedLabel}>Next steps</span>
              <SummaryList items={nextSteps} />
            </div>
          )}

          <p className={styles.meta}>
            {suggestion.provider || 'AI'} ·{' '}
            {suggestion.model_name || 'unknown model'} ·{' '}
            {formatDate(suggestion.created_at) || 'just now'}
            {ticketStatus ? ` · Ticket status at generation: ${ticketStatus}` : ''}
          </p>

          <p className={styles.advisory}>
            <Icon name="alert-circle" size={14} />
            <span>
              Advisory only — this summary is informational for the support
              team. It is stored as PENDING review and never changes the
              ticket or adds comments.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
