import { useState, useRef, useEffect } from 'react';
import { useAddComment } from '../hooks/useTickets';
import { useAuth } from '../../auth/hooks/useAuth';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import styles from './ReplyComposer.module.css';

export default function ReplyComposer({ ticket, draftText = '', onDraftCleared }) {
  const { role } = useAuth();
  const isStaff = role === 'AGENT' || role === 'ADMIN';

  const [activeTab, setActiveTab] = useState('reply'); // 'reply' | 'internal'
  const [message, setMessage] = useState('');
  const [hasDraftLoaded, setHasDraftLoaded] = useState(false);
  const [reviewedDraft, setReviewedDraft] = useState(false);
  const [errorText, setErrorText] = useState('');

  const textareaRef = useRef(null);
  const addCommentMutation = useAddComment();

  const [prevDraftText, setPrevDraftText] = useState(draftText);
  if (draftText !== prevDraftText) {
    setPrevDraftText(draftText);
    if (draftText) {
      setMessage(draftText);
      setActiveTab('reply');
      setHasDraftLoaded(true);
      setReviewedDraft(false);
    }
  }

  // Focus textarea when draft is loaded
  useEffect(() => {
    if (draftText) {
      textareaRef.current?.focus();
    }
  }, [draftText]);

  // Adjust textarea height automatically
  const handleTextChange = (e) => {
    setMessage(e.target.value);
    setErrorText('');
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(100, textarea.scrollHeight)}px`;
    }
  };

  const isInternal = activeTab === 'internal' && isStaff;
  const isPending = addCommentMutation.isPending;
  const isSendDisabled =
    !message.trim() ||
    isPending ||
    (hasDraftLoaded && !reviewedDraft && activeTab === 'reply');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setErrorText('Please enter a message before sending.');
      return;
    }

    if (hasDraftLoaded && !reviewedDraft && !isInternal) {
      setErrorText('Please check the confirmation box to confirm you reviewed the AI draft.');
      return;
    }

    try {
      await addCommentMutation.mutateAsync({
        ticketId: ticket.id,
        message: trimmed,
        is_internal: isInternal,
      });
      setMessage('');
      setHasDraftLoaded(false);
      setReviewedDraft(false);
      setErrorText('');
      onDraftCleared?.();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      setErrorText(err?.response?.data?.message || err?.message || 'Failed to send comment.');
    }
  };

  return (
    <div className={styles.composerCard} aria-label="Reply composer">
      {isStaff && (
        <div className={styles.tabsRow}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'reply' ? styles.activeTab : ''}`}
            onClick={() => {
              setActiveTab('reply');
              setErrorText('');
            }}
          >
            Reply to customer
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'internal' ? styles.activeTab : ''}`}
            onClick={() => {
              setActiveTab('internal');
              setErrorText('');
            }}
          >
            Internal note
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.labelRow}>
          <span className={styles.fieldLabel}>
            {hasDraftLoaded && activeTab === 'reply'
              ? 'AI-assisted draft · editable'
              : activeTab === 'internal'
              ? 'Internal team note · private'
              : 'Your reply'}
          </span>
        </div>

        <textarea
          ref={textareaRef}
          className={`${styles.textarea} ${isInternal ? styles.internalTextarea : ''}`}
          rows={4}
          value={message}
          onChange={handleTextChange}
          placeholder={
            isInternal
              ? 'Add an internal note only visible to team members...'
              : 'Write a public reply to the customer...'
          }
        />

        <div className={styles.contextLine}>
          {isInternal ? (
            <span className={styles.noteContext}>Private note · visible to support team only</span>
          ) : (
            <span className={styles.replyContext}>
              To: {ticket?.customer_email || 'customer'} · Public reply
            </span>
          )}
        </div>

        {hasDraftLoaded && activeTab === 'reply' && (
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkboxInput}
              checked={reviewedDraft}
              onChange={(e) => setReviewedDraft(e.target.checked)}
            />
            <span className={styles.checkboxText}>
              I reviewed and edited this AI draft. Ready to send.
            </span>
          </label>
        )}

        {errorText && <p className={styles.errorText}>{errorText}</p>}

        <div className={styles.footerRow}>
          <span className={styles.statusMuted}>
            Not sent · Sending requires your action
          </span>

          <button
            type="submit"
            className={styles.sendButton}
            disabled={isSendDisabled}
          >
            {isPending && <Spinner size="sm" />}
            <span>{isInternal ? 'Add note' : 'Send reply'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
