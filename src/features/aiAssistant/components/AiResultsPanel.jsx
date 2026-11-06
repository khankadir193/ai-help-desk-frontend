import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusPill from '../../../components/StatusPill/StatusPill';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/Icon/Icon';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from '../AiAssistantPage.module.css';

/**
 * Results area of the AI Assistant page. Pure presentation: it renders the
 * suggestion the page passed in (read from the existing per-ticket client
 * cache written by the existing mutations in features/tickets) and never
 * touches the network itself, so no backend call is duplicated.
 *
 * Suggestions are advisory: everything here is read-only or an editable,
 * explicitly-copied draft. Nothing updates the ticket or posts comments —
 * the PENDING suggestion workflow is surfaced via the status badge, as on
 * the Ticket Details AI cards.
 */

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

/** Self-transient copy button (falls back to a hidden textarea for http://). */
function CopyButton({ text, disabled = false }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = text;
      fallback.setAttribute('readonly', '');
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.appendChild(fallback);
      fallback.select();
      try {
        document.execCommand('copy');
      } catch {
        /* no-op: clipboard unavailable */
      }
      document.body.removeChild(fallback);
    }
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleCopy}
      disabled={disabled}
    >
      <Icon name={copied ? 'check' : 'copy'} size={13} strokeWidth={copied ? 2.5 : 1.75} />
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </Button>
  );
}

/** Editable reply draft, remounted (keyed by suggestion id upstream) on each new generation. */
function ReplyDraftEditor({ initialDraft, ticketId }) {
  const [draft, setDraft] = useState(initialDraft);

  return (
    <div className={styles.suggestion}>
      <div className={styles.draftHead}>
        <label htmlFor="ai-assistant-reply-draft" className={styles.suggestedLabel}>
          Draft (editable)
        </label>
        <CopyButton text={draft} disabled={!draft.trim()} />
      </div>
      <textarea
        id="ai-assistant-reply-draft"
        className={styles.draftTextarea}
        rows={8}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="The generated reply will appear here for review…"
      />
      <p className={styles.draftHint}>
        Advisory only — copy the text or open the full ticket and paste it into
        the reply composer to review and post it yourself. Nothing is ever sent
        automatically.
      </p>
      <Link to={`/tickets/${ticketId}`} className={styles.openTicketLink}>
        Open full ticket
        <Icon name="chevron-right" size={13} />
      </Link>
    </div>
  );
}

/** Presentation-only list section rendered only when the backend returned items. */
function ResultList({ label, items }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div className={styles.summaryBlock}>
      <span className={styles.suggestedLabel}>{label}</span>
      <ul className={styles.summaryList}>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

const buildSummaryText = (result) => {
  const asList = (items) =>
    Array.isArray(items) && items.length ? items.map((i) => `- ${i}`).join('\n') : '';
  return [
    result.mainIssue ? `Main issue: ${result.mainIssue}` : '',
    asList(result.details) ? `Details:\n${asList(result.details)}` : '',
    asList(result.troubleshootingDone)
      ? `Troubleshooting done:\n${asList(result.troubleshootingDone)}`
      : '',
    result.currentStatus ? `Current status: ${result.currentStatus}` : '',
    asList(result.nextSteps) ? `Next steps:\n${asList(result.nextSteps)}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
};

const buildResultCopy = (featureId, result) => {
  const confidence = formatConfidence(result?.confidence);
  const confidenceText = confidence !== null ? ` (confidence ${confidence}%)` : '';
  const reason = typeof result?.reason === 'string' ? result.reason.trim() : '';

  switch (featureId) {
    case 'classification':
      return [
        `Suggested category: ${result?.suggestedCategory || '—'}${confidenceText}`,
        reason ? `Reason: ${reason}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    case 'priority':
      return [
        `Suggested priority: ${result?.suggestedPriority || '—'}${confidenceText}`,
        reason ? `Reason: ${reason}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    case 'reply':
      return typeof result?.draft === 'string' ? result.draft : '';
    case 'summary':
      return buildSummaryText(result ?? {});
    default:
      return '';
  }
};

export default function AiResultsPanel({ feature, ticket, ticketId, suggestion, mutation, onRun }) {
  const result = suggestion?.result ?? null;
  const resultCopy = suggestion ? buildResultCopy(feature?.id, result) : '';
  const isPending = Boolean(mutation?.isPending);

  /* No feature activated (or no ticket picked) yet — neutral guidance state. */
  if (!feature || !ticketId) {
    return (
      <div className={styles.resultsPanel}>
        <div className={styles.resultsEmpty}>
          <span className={styles.resultsEmptyIcon} aria-hidden="true">
            <Icon name="sparkle" size={22} />
          </span>
          <h3 className={styles.resultsEmptyTitle}>Choose an AI action</h3>
          <p className={styles.resultsEmptyText}>
            {ticketId
              ? 'Activate one of the features above to generate a suggestion for the selected ticket.'
              : 'Pick a ticket first, then activate one of the AI features above.'}
          </p>
        </div>
      </div>
    );
  }

  const hasBody =
    !isPending &&
    !mutation?.isError &&
    suggestion &&
    (feature.id === 'classification'
      ? Boolean(result?.suggestedCategory)
      : feature.id === 'priority'
      ? Boolean(result?.suggestedPriority)
      : feature.id === 'reply'
      ? typeof result?.draft === 'string' && Boolean(result.draft.trim())
      : Boolean(
          result?.mainIssue ||
            result?.currentStatus ||
            (Array.isArray(result?.details) && result.details.length) ||
            (Array.isArray(result?.troubleshootingDone) && result.troubleshootingDone.length) ||
            (Array.isArray(result?.nextSteps) && result.nextSteps.length)
        ));

  return (
    <div className={styles.resultsPanel}>
      <div className={styles.resultHead}>
        <div className={styles.resultHeadMain}>
          <h3 className={styles.resultTitle}>
            <Icon name="sparkle" size={15} className={styles.resultTitleIcon} />
            <span>{feature.title}</span>
          </h3>
          <p className={styles.resultTicketRef}>
            Ticket #{ticketId}
            {ticket?.title ? ` · ${ticket.title}` : ''}
          </p>
        </div>
        {suggestion?.status && (
          <span className={styles.pendingBadge}>
            {suggestion.status === 'PENDING' ? 'PENDING review' : suggestion.status}
          </span>
        )}
      </div>

      {/* Loading state for the active feature */}
      {isPending && (
        <div className={styles.resultLoading} role="status">
          <Spinner size="sm" label="" />
          <span>{feature.pendingLabel}</span>
          <span className={styles.resultLoadingHint}>
            This usually takes a few seconds.
          </span>
        </div>
      )}

      {/* Error state with retry — the backend stays the source of truth */}
      {!isPending && mutation?.isError && (
        <div className={styles.errorBanner} role="alert">
          <div className={styles.errorLeft}>
            <Icon name="alert-circle" size={18} />
            <span>{getErrorMessage(mutation.error)}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={onRun}>
            Try Again
          </Button>
        </div>
      )}

      {/* Suggestion present but the backend returned nothing usable */}
      {!isPending && !mutation?.isError && suggestion && !hasBody && (
        <p className={styles.resultEmptyNote}>
          The AI returned an empty result. Use the card above to run it again.
        </p>
      )}

      {!isPending && !mutation?.isError && !suggestion && (
        <div className={styles.resultAwaiting}>
          <p className={styles.resultEmptyNote}>
            No result for this ticket yet — activate the card above to run{' '}
            <strong>{feature.title}</strong>.
          </p>
        </div>
      )}

      {hasBody && (
        <>
          <div className={styles.resultMeta}>
            <span>
              {suggestion.provider || 'AI'} · {suggestion.model_name || 'unknown model'} ·{' '}
              {formatDate(suggestion.created_at) || 'just now'}
            </span>
            {resultCopy && <CopyButton text={resultCopy} />}
          </div>

          {feature.id === 'classification' && (
            <div className={styles.suggestion}>
              <div className={styles.suggestionHead}>
                <span className={styles.suggestedLabel}>Suggested category</span>
                <span className={styles.suggestedName}>{result.suggestedCategory}</span>
              </div>
              {(() => {
                const confidence = formatConfidence(result.confidence);
                const currentCategoryId = ticket?.category_id ?? ticket?.category?.id ?? null;
                const suggestedCategoryId = result?.suggestedCategoryId;
                const matchesCurrent =
                  suggestedCategoryId != null &&
                  currentCategoryId != null &&
                  String(suggestedCategoryId) === String(currentCategoryId);
                if (confidence === null && !matchesCurrent) return null;
                return (
                  <div className={styles.chipsRow}>
                    {confidence !== null && (
                      <span className={styles.confidenceChip}>Confidence {confidence}%</span>
                    )}
                    {matchesCurrent && (
                      <span className={styles.matchChip}>Matches the current category</span>
                    )}
                  </div>
                );
              })()}
              {typeof result.reason === 'string' && result.reason.trim() && (
                <p className={styles.reason}>{result.reason}</p>
              )}
            </div>
          )}

          {feature.id === 'priority' && (
            <div className={styles.suggestion}>
              <div className={styles.suggestionHead}>
                <span className={styles.suggestedLabel}>Suggested priority</span>
                <StatusPill
                  status={result.suggestedPriority}
                  label={PRIORITY_LABELS[result.suggestedPriority] || result.suggestedPriority}
                />
              </div>
              {(() => {
                const confidence = formatConfidence(result.confidence);
                const suggested = String(result.suggestedPriority || '').toUpperCase();
                const matchesCurrent =
                  suggested !== '' &&
                  ticket?.priority != null &&
                  String(ticket.priority).toUpperCase() === suggested;
                if (confidence === null && !matchesCurrent) return null;
                return (
                  <div className={styles.chipsRow}>
                    {confidence !== null && (
                      <span className={styles.confidenceChip}>Confidence {confidence}%</span>
                    )}
                    {matchesCurrent && (
                      <span className={styles.matchChip}>Matches the current priority</span>
                    )}
                  </div>
                );
              })()}
              {typeof result.reason === 'string' && result.reason.trim() && (
                <p className={styles.reason}>{result.reason}</p>
              )}
            </div>
          )}

          {feature.id === 'reply' && (
            <ReplyDraftEditor
              key={String(suggestion.id ?? '')}
              initialDraft={result.draft}
              ticketId={ticketId}
            />
          )}

          {feature.id === 'summary' && (
            <div className={styles.suggestion}>
              {result.mainIssue && (
                <div className={styles.summaryBlock}>
                  <span className={styles.suggestedLabel}>Main issue</span>
                  <p className={styles.summaryText}>{result.mainIssue}</p>
                </div>
              )}
              <ResultList label="Details" items={result.details} />
              <ResultList label="Troubleshooting done" items={result.troubleshootingDone} />
              {result.currentStatus && (
                <div className={styles.summaryBlock}>
                  <span className={styles.suggestedLabel}>Current status</span>
                  <p className={styles.summaryText}>{result.currentStatus}</p>
                </div>
              )}
              <ResultList label="Next steps" items={result.nextSteps} />
              {result.ticketStatus && (
                <p className={styles.resultFootnote}>
                  Ticket status at generation: {result.ticketStatus}
                </p>
              )}
            </div>
          )}

          <p className={styles.advisory}>
            <Icon name="alert-circle" size={14} />
            <span>
              Advisory only — nothing on this ticket was changed. The suggestion
              is stored as PENDING for review and is never applied
              automatically.
            </span>
          </p>
        </>
      )}
    </div>
  );
}
