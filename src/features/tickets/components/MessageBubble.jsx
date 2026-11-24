import Avatar from '../../../components/Avatar/Avatar';
import Icon from '../../../components/Icon/Icon';
import { formatInitials } from '../utils/ticketFormatters';
import styles from './MessageBubble.module.css';

function formatMessageTime(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeFormatted = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dateFormatted} · ${timeFormatted}`;
  } catch {
    return dateStr;
  }
}

export default function MessageBubble({ message, isOriginalDescription = false, customerName = '' }) {
  if (!message) return null;

  const isInternal = Boolean(message.is_internal);
  const authorRole = (message.author?.role || message.role || (isOriginalDescription ? 'CUSTOMER' : '')).toUpperCase();
  const isCustomer = authorRole === 'CUSTOMER' || isOriginalDescription;

  const authorName = message.author?.name || message.author_name || (isOriginalDescription ? customerName : 'Support Agent');
  const initials = formatInitials(authorName);
  const formattedTime = formatMessageTime(message.created_at);

  let variantClass = styles.customerCard;
  if (isInternal) {
    variantClass = styles.internalNoteCard;
  } else if (!isCustomer) {
    variantClass = styles.agentReplyCard;
  }

  return (
    <div className={`${styles.messageCard} ${variantClass}`}>
      <div className={styles.header}>
        <div className={styles.authorMeta}>
          <Avatar initials={initials} size="sm" />
          <div className={styles.authorInfo}>
            <span className={styles.authorName}>{authorName}</span>
            <span className={styles.timestamp}>{formattedTime}</span>
          </div>
        </div>

        <div className={styles.badgeContainer}>
          {isInternal ? (
            <span className={styles.internalBadge}>
              <Icon name="lock" size={12} className={styles.badgeIcon} />
              <span>Internal note · Private</span>
            </span>
          ) : !isCustomer ? (
            <span className={styles.agentBadge}>
              <Icon name="send" size={12} className={styles.badgeIcon} />
              <span>Agent reply · Public</span>
            </span>
          ) : (
            <span className={styles.customerBadge}>Customer</span>
          )}
        </div>
      </div>

      <div className={styles.body}>
        <p className={styles.bodyText}>{message.message || message.description || ''}</p>
        
        {Array.isArray(message.attachments) && message.attachments.length > 0 && (
          <div className={styles.attachmentsList}>
            {message.attachments.map((att, idx) => (
              <div key={idx} className={styles.attachmentChip}>
                <Icon name="paperclip" size={14} />
                <span className={styles.attachmentName}>{att.name || att.filename || `Attachment ${idx + 1}`}</span>
                {att.size && <span className={styles.attachmentSize}>({Math.round(att.size / 1024)} KB)</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
