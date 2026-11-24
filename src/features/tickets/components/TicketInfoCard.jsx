import Avatar from '../../../components/Avatar/Avatar';
import { formatInitials } from '../utils/ticketFormatters';
import styles from './TicketInfoCard.module.css';

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeFormatted = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dateFormatted} · ${timeFormatted}`;
  } catch {
    return dateStr;
  }
}

export default function TicketInfoCard({ ticket, isStaff = true }) {
  if (!ticket) return null;

  const agentName = ticket.assigned_agent_name || null;
  const agentInitials = agentName ? formatInitials(agentName) : '';
  const categoryName = ticket.category_name || 'General';
  const channel = ticket.source || 'Email';
  const tags = Array.isArray(ticket.tags) ? ticket.tags : [];
  const lastUpdated = formatDateTime(ticket.updated_at || ticket.created_at);

  return (
    <div className={styles.card} aria-label="Ticket information">
      <h3 className={styles.title}>Ticket information</h3>

      <div className={styles.fieldsList}>
        {isStaff && (
          <div className={styles.fieldItem}>
            <span className={styles.fieldLabel}>Assigned agent</span>
            {agentName ? (
              <div className={styles.agentValue}>
                <Avatar initials={agentInitials} size="xs" />
                <span className={styles.agentName}>{agentName}</span>
              </div>
            ) : (
              <div className={styles.unassignedValue}>
                <span className={styles.unassignedIcon}>○</span>
                <span>Unassigned</span>
              </div>
            )}
          </div>
        )}

        <div className={styles.fieldItem}>
          <span className={styles.fieldLabel}>Category</span>
          <span className={styles.fieldValue}>{categoryName}</span>
        </div>

        <div className={styles.fieldItem}>
          <span className={styles.fieldLabel}>Channel</span>
          <span className={styles.fieldValue}>{channel}</span>
        </div>

        {isStaff && (
          <div className={styles.fieldItem}>
            <span className={styles.fieldLabel}>Tags</span>
            {tags.length > 0 ? (
              <div className={styles.tagsContainer}>
                {tags.map((tag, idx) => (
                  <span key={idx} className={styles.tagChip}>
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <span className={styles.emptyTags}>None</span>
            )}
          </div>
        )}

        <div className={styles.fieldItem}>
          <span className={styles.fieldLabel}>Last updated</span>
          <span className={styles.fieldValue}>{lastUpdated}</span>
        </div>
      </div>
    </div>
  );
}
