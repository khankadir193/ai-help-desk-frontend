import StatusPill from '../../../components/StatusPill/StatusPill';
import styles from './TicketContextCard.module.css';

function getSlaText(ticket) {
  if (!ticket) return null;
  const status = (ticket.status || '').toUpperCase();
  if (status === 'RESOLVED' || status === 'CLOSED') {
    return null;
  }

  const priority = (ticket.priority || 'MEDIUM').toUpperCase();
  // Target response windows in milliseconds
  const slaTargetMs = {
    URGENT: 1 * 60 * 60 * 1000, // 1 hour
    HIGH: 4 * 60 * 60 * 1000,   // 4 hours
    MEDIUM: 8 * 60 * 60 * 1000, // 8 hours
    LOW: 24 * 60 * 60 * 1000,   // 24 hours
  }[priority] || 8 * 60 * 60 * 1000;

  const createdTime = new Date(ticket.created_at || Date.now()).getTime();
  const deadline = createdTime + slaTargetMs;
  const remainingMs = deadline - Date.now();

  if (remainingMs <= 0) {
    const overdueMin = Math.max(1, Math.round(Math.abs(remainingMs) / (60 * 1000)));
    return `Reply overdue by ${overdueMin} min`;
  }

  const remainingMin = Math.round(remainingMs / (60 * 1000));
  if (remainingMin < 60) {
    return `Next reply due in ${remainingMin} min`;
  }
  const hours = Math.floor(remainingMin / 60);
  const mins = remainingMin % 60;
  return `Next reply due in ${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();
}

export default function TicketContextCard({ ticket }) {
  if (!ticket) return null;

  const slaMessage = getSlaText(ticket);

  return (
    <div className={styles.card} aria-label="Ticket context">
      <h3 className={styles.title}>Ticket context</h3>
      <div className={styles.pillsRow}>
        <StatusPill status={ticket.status} />
        <StatusPill priority={ticket.priority} />
      </div>
      {slaMessage && (
        <div className={styles.slaNotice}>
          {slaMessage}
        </div>
      )}
    </div>
  );
}
