import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTicket, useUpdateTicketStatus } from '../hooks/useTickets';
import {
  ALLOWED_STATUS_TRANSITIONS,
} from '../services/ticketService';
import { useAuth } from '../../auth/hooks/useAuth';
import StatusPill from '../../../components/StatusPill/StatusPill';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/Icon/Icon';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import TicketAssignDialog from './TicketAssignDialog';
import AiConversationSummary from './AiConversationSummary';
import AiPrioritySuggestion from './AiPrioritySuggestion';
import AiReplyDraft from './AiReplyDraft';
import TicketAiClassification from './TicketAiClassification';
import TicketComments from './TicketComments';
import TicketHistory from './TicketHistory';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from './TicketDetails.module.css';

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

const STATUSDescriptions = {
  OPEN: 'Waiting to be picked up by support.',
  IN_PROGRESS: 'A support agent is actively working on this ticket.',
  RESOLVED: 'The issue has been resolved.',
  CLOSED: 'This ticket has been closed and is read-only.',
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

export default function TicketDetails({ ticketId }) {
  const { role } = useAuth();
  const navigate = useNavigate();

  const {
    data: ticket,
    isLoading,
    isError,
    error,
    refetch,
  } = useTicket(ticketId);

  const statusMutation = useUpdateTicketStatus();

  const [nextStatus, setNextStatus] = useState('');
  const [statusError, setStatusError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  // Controlled composer text owned here so the AI reply draft card can fill
  // it on explicit agent action (see handleUseDraft / TicketComments).
  const [composerMessage, setComposerMessage] = useState('');

  // Transient success toast (status & assignment updates)
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 4500);
  };

  /** Fill the existing comment composer with the reviewed AI reply draft. */
  const handleUseDraft = (text) => {
    setComposerMessage(text);
    showSuccess('Draft added to the reply composer below.');
  };

  if (isLoading) {
    return (
      <main className="dashboard-content" aria-label="Ticket Details">
        <div className={`${styles.card} ${styles.stateBox}`}>
          <Spinner size="lg" label="Loading ticket..." />
        </div>
      </main>
    );
  }

  if (isError) {
    const status = error?.response?.status;
    return (
      <main className="dashboard-content" aria-label="Ticket Details">
        <div className={`${styles.card} ${styles.stateBox}`}>
          <Icon name="alert-circle" size={36} className={styles.stateIcon} />
          <h2 className={styles.stateTitle}>
            {status === 403
              ? 'Access denied'
              : status === 404
              ? 'Ticket not found'
              : 'Something went wrong'}
          </h2>
          <p className={styles.stateText}>{getErrorMessage(error)}</p>
          <div className={styles.stateActions}>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/tickets')}>
              Back to Tickets
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const isStaff = role === 'AGENT' || role === 'ADMIN';
  const isAdmin = role === 'ADMIN';
  const isClosed = ticket.status === 'CLOSED';

  // Mirror of the backend transition matrix — the server remains the authority
  const allowedNext = ALLOWED_STATUS_TRANSITIONS[ticket.status] || [];

  const handleStatusChange = async () => {
    if (!nextStatus) return;
    setStatusError('');
    try {
      await statusMutation.mutateAsync({ id: ticket.id, status: nextStatus });
      showSuccess(`Status updated to ${STATUS_LABELS[nextStatus] || nextStatus}.`);
      setNextStatus('');
    } catch (err) {
      setStatusError(getErrorMessage(err));
    }
  };

  return (
    <main className="dashboard-content" aria-label="Ticket Details">
      <div className={styles.container}>
        {/* Breadcrumb / Back */}
        <Link to="/tickets" className={styles.backLink}>
          <Icon name="chevron-left" size={15} />
          <span>Back to Tickets</span>
        </Link>

        {/* Main Detail Card */}
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <span className={styles.ticketId}>Ticket #{ticket.id}</span>
              <h2 className={styles.title}>{ticket.title}</h2>
              <div className={styles.pillRow}>
                <StatusPill
                  status={ticket.status}
                  label={STATUS_LABELS[ticket.status] || ticket.status}
                />
                <StatusPill
                  status={ticket.priority}
                  label={PRIORITY_LABELS[ticket.priority] || ticket.priority}
                />
              </div>
            </div>

            {isAdmin && (
              <Button
                variant="secondary"
                onClick={() => setIsAssignDialogOpen(true)}
                disabled={isClosed}
              >
                <Icon name="users" size={15} />
                <span>
                  {ticket.assigned_agent ? 'Reassign' : 'Assign Agent'}
                </span>
              </Button>
            )}
          </div>

          {successMessage && (
            <div className={styles.successToast} role="status">
              <Icon name="check-circle" size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Meta Grid */}
          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Category</span>
              <span className={styles.metaValue}>
                {ticket.category ? (
                  <>
                    {ticket.category.name}
                    {ticket.category.is_active === false && (
                      <span className={styles.metaNote}> (inactive)</span>
                    )}
                  </>
                ) : (
                  '—'
                )}
              </span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Assigned Agent</span>
              <span className={styles.metaValue}>
                {ticket.assigned_agent ? ticket.assigned_agent.name : 'Unassigned'}
                {ticket.assigned_agent?.email && (
                  <span className={styles.metaSecond}>{ticket.assigned_agent.email}</span>
                )}
              </span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Status</span>
              <span className={styles.metaValue}>
                {STATUS_LABELS[ticket.status] || ticket.status}
                {STATUSDescriptions[ticket.status] && (
                  <span className={styles.metaSecond}>
                    {STATUSDescriptions[ticket.status]}
                  </span>
                )}
              </span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Customer</span>
              <span className={styles.metaValue}>
                {ticket.customer?.name || '—'}
                {ticket.customer?.email && (
                  <span className={styles.metaSecond}>{ticket.customer.email}</span>
                )}
              </span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Created</span>
              <span className={styles.metaValue}>{formatDate(ticket.created_at) || '—'}</span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Updated</span>
              <span className={styles.metaValue}>{formatDate(ticket.updated_at) || '—'}</span>
            </div>

            {ticket.resolved_at && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Resolved</span>
                <span className={styles.metaValue}>{formatDate(ticket.resolved_at)}</span>
              </div>
            )}

            {ticket.closed_at && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Closed</span>
                <span className={styles.metaValue}>{formatDate(ticket.closed_at)}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className={styles.descriptionSection}>
            <h3 className={styles.sectionTitle}>Description</h3>
            <p className={styles.description}>{ticket.description}</p>
          </div>

          {/* Staff controls: status transitions (Agent: assigned tickets, Admin: all) */}
          {isStaff && (
            <div className={styles.statusSection}>
              <h3 className={styles.sectionTitle}>Change Status</h3>
              {statusError && (
                <div className={styles.errorBanner} role="alert">
                  <Icon name="alert-circle" size={18} className={styles.errorBannerIcon} />
                  <span>{statusError}</span>
                </div>
              )}
              {isClosed ? (
                <p className={styles.closedNote}>
                  This ticket is CLOSED and its status can no longer be changed.
                </p>
              ) : allowedNext.length === 0 ? (
                <p className={styles.closedNote}>No status change available.</p>
              ) : (
                <div className={styles.statusControls}>
                  <select
                    id="ticket-next-status"
                    aria-label="New status"
                    className={styles.statusSelect}
                    value={nextStatus}
                    onChange={(e) => {
                      setNextStatus(e.target.value);
                      if (statusError) setStatusError('');
                    }}
                    disabled={statusMutation.isPending}
                  >
                    <option value="">Select new status...</option>
                    {allowedNext.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status] || status}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="primary"
                    onClick={handleStatusChange}
                    disabled={!nextStatus}
                    isLoading={statusMutation.isPending}
                  >
                    Apply Status
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Category Suggestion (AGENT assigned / ADMIN only; the backend
            rejects CUSTOMERs and unassigned agents) */}
        {isStaff && (
          <TicketAiClassification ticket={ticket} ticketId={ticket.id} />
        )}

        {/* AI Priority Suggestion (AGENT assigned / ADMIN only; the backend
            rejects CUSTOMERs and unassigned agents) */}
        {isStaff && (
          <AiPrioritySuggestion ticket={ticket} ticketId={ticket.id} />
        )}

        {/* AI Reply Draft (AGENT assigned / ADMIN only; the backend rejects
            CUSTOMERs and unassigned agents). Generated ONLY — the agent
            reviews/edits and explicitly hands it to the composer. */}
        {isStaff && (
          <AiReplyDraft ticketId={ticket.id} onUseDraft={handleUseDraft} />
        )}

        {/* AI Conversation Summary (AGENT assigned / ADMIN only; the backend
            rejects CUSTOMERs and unassigned agents). Informational only —
            never modifies the ticket or creates comments. */}
        {isStaff && <AiConversationSummary ticketId={ticket.id} />}

        {/* Audit History (AGENT assigned / ADMIN only; backend rejects others) */}
        {isStaff && <TicketHistory ticketId={ticket.id} />}

        {/* Comments & Internal Notes */}
        <TicketComments
          ticketId={ticket.id}
          message={composerMessage}
          onMessageChange={setComposerMessage}
        />
      </div>

      {isAssignDialogOpen && (
        <TicketAssignDialog
          isOpen={isAssignDialogOpen}
          onClose={() => setIsAssignDialogOpen(false)}
          onSuccess={showSuccess}
          ticket={ticket}
        />
      )}
    </main>
  );
}
