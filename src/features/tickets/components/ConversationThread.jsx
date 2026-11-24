import { useTicketComments } from '../hooks/useTickets';
import MessageBubble from './MessageBubble';
import ReplyComposer from './ReplyComposer';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import styles from './ConversationThread.module.css';

function formatThreadDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function ConversationThread({ ticket, draftText, onDraftCleared }) {
  const ticketId = ticket?.id;
  const { data: comments = [], isLoading } = useTicketComments(ticketId);

  // Initial message is the ticket's description
  const initialMessage = {
    id: `desc-${ticket?.id}`,
    ticket_id: ticket?.id,
    author: {
      name: ticket?.customer_name || 'Customer',
      role: 'CUSTOMER',
    },
    message: ticket?.description || '',
    attachments: ticket?.attachments || [],
    is_internal: false,
    created_at: ticket?.created_at,
  };

  const allMessages = [initialMessage, ...comments];
  const messageCount = allMessages.length;
  const threadDate = formatThreadDate(allMessages[allMessages.length - 1]?.created_at || ticket?.created_at);

  return (
    <div className={styles.threadContainer} aria-label="Conversation thread">
      <div className={styles.threadHeader}>
        <h3 className={styles.title}>Conversation</h3>
        <span className={styles.metaCount}>
          {messageCount} {messageCount === 1 ? 'message' : 'messages'}
          {threadDate ? ` · ${threadDate}` : ''}
        </span>
      </div>

      <div className={styles.messagesList}>
        {allMessages.map((msg, index) => (
          <MessageBubble
            key={msg.id || index}
            message={msg}
            isOriginalDescription={index === 0}
            customerName={ticket?.customer_name}
          />
        ))}

        {isLoading && (
          <div className={styles.loadingComments}>
            <Spinner size="sm" />
            <span>Loading conversation...</span>
          </div>
        )}
      </div>

      <ReplyComposer
        ticket={ticket}
        draftText={draftText}
        onDraftCleared={onDraftCleared}
      />
    </div>
  );
}
