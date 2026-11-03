import { useState } from 'react';
import { useAiReplyDraft, useGenerateReplyDraft } from '../hooks/useTickets';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/Icon/Icon';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from './TicketAiClassification.module.css';

/**
 * AI Reply Draft card (AGENT assigned / ADMIN only — TicketDetails renders it
 * for staff, and the backend remains the source of truth).
 *
 * Backend contract (src/modules/ai):
 *  - POST /api/v1/tickets/:id/ai/reply-draft, no request body. The draft is
 *    stored with status PENDING and is advisory: it is never posted, sent,
 *    or converted into a comment, and nothing on the ticket is changed.
 *  - result: { draft } — a trimmed, non-empty plain-text reply (≤4000 chars).
 *  - The result shown here comes from the POST response itself (the backend
 *    has no GET endpoint for suggestions); it is kept in the client cache.
 *
 * The agent reviews and edits the draft in the textarea below and explicitly
 * hands it off to the existing public comment composer via onUseDraft.
 * Nothing is posted or published automatically.
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

/**
 * Editable draft editor. Keyed by the suggestion id in AiReplyDraft so the
 * state resets (remounts initialized from the fresh draft) on every new
 * generation — no effect needed to sync external suggestion state.
 */
function AiReplyDraftEditor({ initialDraft, onUseDraft }) {
  const [draft, setDraft] = useState(initialDraft);

  return (
    <>
      <label htmlFor="ai-reply-draft-text" className={styles.suggestedLabel}>
        Draft (editable)
      </label>
      <textarea
        id="ai-reply-draft-text"
        className={styles.draftTextarea}
        rows={6}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="The generated reply will appear here for review…"
      />

      <div className={styles.draftActions}>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onUseDraft?.(draft)}
          disabled={!draft.trim()}
        >
          Use in Composer
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setDraft('')}
          disabled={!draft.trim()}
        >
          Clear
        </Button>
      </div>
    </>
  );
}

export default function AiReplyDraft({ ticketId, onUseDraft }) {
  const { data } = useAiReplyDraft(ticketId);
  const suggestion = data ?? null;
  const draftMutation = useGenerateReplyDraft();

  const result = suggestion?.result ?? null;
  const generatedDraft =
    typeof result?.draft === 'string' ? result.draft : '';
  const isPending = draftMutation.isPending;

  return (
    <div className={styles.card} aria-label="AI Reply Draft">
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Icon name="sparkle" size={15} className={styles.titleIcon} />
          <span>AI Reply Draft</span>
          {suggestion?.status && (
            <span
              className={styles.pendingBadge}
              title="This draft is pending review"
            >
              {suggestion.status}
            </span>
          )}
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => draftMutation.mutate({ id: ticketId })}
          isLoading={isPending}
        >
          <Icon name="sparkle" size={14} />
          <span>{suggestion ? 'Run Again' : 'Generate Draft'}</span>
        </Button>
      </div>

      {draftMutation.isError && !isPending && (
        <div className={styles.errorBanner} role="alert">
          <div className={styles.errorLeft}>
            <Icon name="alert-circle" size={18} />
            <span>{getErrorMessage(draftMutation.error)}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => draftMutation.mutate({ id: ticketId })}
          >
            Try Again
          </Button>
        </div>
      )}

      {isPending && (
        <div className={styles.analyzing}>
          <Spinner size="sm" label="" />
          <span>Reviewing the ticket and conversation…</span>
        </div>
      )}

      {!isPending && !suggestion && (
        <p className={styles.hint}>
          Let the AI draft the next customer-facing reply based on this ticket
          and its conversation. Drafts are advisory only — review and edit
          here, then post it yourself; nothing is ever sent automatically.
        </p>
      )}

      {!isPending && suggestion && !generatedDraft && (
        <p className={styles.draftEmpty}>
          The AI returned an empty draft. Use Run Again to try once more.
        </p>
      )}

      {!isPending && suggestion && (
        <AiReplyDraftEditor
          // Fresh editor state for each new draft generation.
          key={String(suggestion.id ?? '')}
          initialDraft={generatedDraft}
          onUseDraft={onUseDraft}
        />
      )}

      {!isPending && suggestion && (
        <>
          <p className={styles.meta}>
            {suggestion.provider || 'AI'} ·{' '}
            {suggestion.model_name || 'unknown model'} ·{' '}
            {formatDate(suggestion.created_at) || 'just now'}
          </p>

          <p className={styles.advisory}>
            <Icon name="alert-circle" size={14} />
            <span>
              Advisory only — this draft is not sent or posted automatically.
              Use it in the reply composer below to review, edit, and post it
              yourself as a public comment.
            </span>
          </p>
        </>
      )}
    </div>
  );
}
