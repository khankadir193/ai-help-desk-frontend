import { useTicketHistory } from '../hooks/useTickets';
import Avatar from '../../../components/Avatar/Avatar';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/Icon/Icon';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from './TicketHistory.module.css';

/**
 * Presentation-only label maps over backend values (TICKET_STATUSES,
 * TICKET_PRIORITIES enums and the audit action/field names actually
 * written by ticket.service.js). No history fields are invented.
 */
const ACTION_LABELS = {
  TICKET_CREATED: 'Ticket created',
  TITLE_CHANGED: 'Title changed',
  DESCRIPTION_CHANGED: 'Description changed',
  PRIORITY_CHANGED: 'Priority changed',
  CATEGORY_CHANGED: 'Category changed',
  STATUS_CHANGED: 'Status changed',
  ASSIGNED: 'Assignment changed',
};

const FIELD_LABELS = {
  title: 'Title',
  description: 'Description',
  priority: 'Priority',
  category_id: 'Category',
  status: 'Status',
  assigned_agent_id: 'Assigned Agent',
};

const STATUS_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

const getInitials = (name) => {
  const source = typeof name === 'string' ? name.trim() : '';
  if (!source) return 'U';
  const parts = source.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const truncate = (text, max = 80) => {
  const flat = String(text).replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
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

/** Render a history value using only what the backend stored in JSONB. */
const formatValue = (fieldName, value) => {
  if (value === null || value === undefined) return null;
  if (fieldName === 'status') return STATUS_LABELS[value] || String(value);
  if (fieldName === 'priority') return PRIORITY_LABELS[value] || String(value);
  if (fieldName === 'assigned_agent_id') return `#${String(value)}`;
  if (fieldName === 'description') return `"${truncate(value)}"`;
  if (fieldName === 'title') return `"${truncate(value, 60)}"`;
  return String(value);
};

export default function TicketHistory({ ticketId }) {
  const {
    data: history = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTicketHistory(ticketId);

  return (
    <div className={styles.card} aria-label="Ticket History">
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span>History</span>
          {!isLoading && history.length > 0 && (
            <span className={styles.badgeCount}>
              {history.length} {history.length === 1 ? 'event' : 'events'}
            </span>
          )}
        </h3>
      </div>

      {isLoading ? (
        <div className={styles.stateBox}>
          <Spinner size="lg" label="Loading history..." />
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
      ) : history.length === 0 ? (
        <p className={styles.emptyText}>No history recorded for this ticket yet.</p>
      ) : (
        <ol className={styles.timeline}>
          {history.map((entry) => {
            const fieldLabel = entry.field_name
              ? FIELD_LABELS[entry.field_name] || entry.field_name
              : null;
            const oldValue = formatValue(entry.field_name, entry.old_value);
            const newValue = formatValue(entry.field_name, entry.new_value);

            let change = null;
            if (oldValue !== null && newValue !== null) {
              change = (
                <>
                  <span className={styles.valueOld} aria-label="Previous value">
                    {oldValue}
                  </span>
                  <Icon name="arrow-down" size={13} className={styles.valueArrow} />
                  <span className={styles.valueNew} aria-label="New value">
                    {newValue}
                  </span>
                </>
              );
            } else if (newValue !== null) {
              change = (
                <>
                  <span className={styles.valuePrefix}>set to</span>
                  <span className={styles.valueNew} aria-label="New value">
                    {newValue}
                  </span>
                </>
              );
            } else if (oldValue !== null) {
              change = <span className={styles.valuePrefix}>cleared</span>;
            }

            return (
              <li key={entry.id} className={styles.entry}>
                <div className={styles.marker}>
                  <Avatar
                    size="sm"
                    type="text"
                    initials={getInitials(entry.changed_by?.name)}
                  />
                </div>

                <div className={styles.body}>
                  <div className={styles.actionRow}>
                    <span className={styles.actionText}>
                      {ACTION_LABELS[entry.action] || entry.action}
                      {fieldLabel && (
                        <span className={styles.fieldName}> · {fieldLabel}</span>
                      )}
                    </span>
                    {change && (
                      <span className={styles.changeChip}>{change}</span>
                    )}
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.actor}>
                      {entry.changed_by?.name || 'System'}
                    </span>
                    <span className={styles.timestamp}>
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
