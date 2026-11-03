import { useState } from 'react';
import { useTicketComments, useAddComment } from '../hooks/useTickets';
import { useAuth } from '../../auth/hooks/useAuth';
import Avatar from '../../../components/Avatar/Avatar';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/Icon/Icon';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from './TicketComments.module.css';

const getInitials = (name) => {
  const source = typeof name === 'string' ? name.trim() : '';
  if (!source) return 'U';
  const parts = source.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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

export default function TicketComments({ ticketId }) {
  const { role } = useAuth();
  const isStaff = role === 'AGENT' || role === 'ADMIN';

  const {
    data: comments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTicketComments(ticketId);

  const addCommentMutation = useAddComment();

  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [fieldError, setFieldError] = useState('');

  const isPending = addCommentMutation.isPending;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = message.trim();
    if (!trimmed) {
      setFieldError('Comment cannot be empty.');
      return;
    }
    setFieldError('');

    try {
      await addCommentMutation.mutateAsync({
        id: ticketId,
        message: trimmed,
        isInternal: isStaff && isInternal,
      });
      setMessage('');
      setIsInternal(false);
    } catch {
      // Failure is rendered from the mutation state below
    }
  };

  return (
    <div className={styles.card} aria-label="Ticket Conversation">
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span>Conversation</span>
          {!isLoading && comments.length > 0 && (
            <span className={styles.badgeCount}>
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </span>
          )}
        </h3>
      </div>

      {/* Thread */}
      {isLoading ? (
        <div className={styles.stateBox}>
          <Spinner size="lg" label="Loading comments..." />
        </div>
      ) : isError ? (
        <div className={styles.errorBanner} role="alert">
          <div className={styles.errorLeft}>
            <Icon name="alert-circle" size={20} />
            <span>{getErrorMessage(error)}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : comments.length === 0 ? (
        <p className={styles.emptyText}>
          {isStaff
            ? 'No conversation yet. Post the first update.'
            : 'No replies on this ticket yet. Add a comment below.'}
        </p>
      ) : (
        <ul className={styles.list}>
          {comments.map((comment) => (
            <li key={comment.id} className={styles.commentRow}>
              <Avatar
                size="sm"
                type="text"
                initials={getInitials(comment.author?.name)}
              />
              <div className={styles.commentBody}>
                <div className={styles.commentMeta}>
                  <span className={styles.authorName}>
                    {comment.author?.name || 'Unknown'}
                  </span>
                  <span className={styles.timestamp}>
                    {formatDate(comment.created_at)}
                  </span>
                  {comment.is_internal && (
                    <span className={styles.internalBadge}>Internal note</span>
                  )}
                </div>
                <p className={styles.message}>{comment.message}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Composer */}
      <form onSubmit={handleSubmit} className={styles.composer} noValidate>
        {addCommentMutation.isError && (
          <div className={styles.errorBanner} role="alert">
            <Icon name="alert-circle" size={18} className={styles.errorBannerIcon} />
            <span>{getErrorMessage(addCommentMutation.error)}</span>
          </div>
        )}
        {fieldError && (
          <p className={styles.fieldError} role="alert">
            {fieldError}
          </p>
        )}

        <label htmlFor="ticket-comment-message" className={styles.composerLabel}>
          Add a comment
        </label>
        <textarea
          id="ticket-comment-message"
          className={`${styles.textarea} ${fieldError ? styles.textareaError : ''}`}
          rows={4}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (fieldError) setFieldError('');
          }}
          placeholder={
            isStaff
              ? 'Write a public reply, or select Internal note below...'
              : 'Write a reply to support...'
          }
          disabled={isPending}
        />

        <div className={styles.composerActions}>
          {isStaff && (
            <label className={styles.internalToggle} htmlFor="ticket-comment-internal">
              <input
                id="ticket-comment-internal"
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                disabled={isPending}
              />
              <span>Internal note (not visible to the customer)</span>
            </label>
          )}
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={isPending}
            isLoading={isPending}
          >
            Post Comment
          </Button>
        </div>
      </form>
    </div>
  );
}
