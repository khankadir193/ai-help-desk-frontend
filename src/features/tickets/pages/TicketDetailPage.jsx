import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTicket } from '../hooks/useTickets';
import { useAuth } from '../../auth/hooks/useAuth';
import { formatTicketId } from '../utils/ticketFormatters';
import TicketContextCard from '../components/TicketContextCard';
import AiAssistancePanel from '../components/AiAssistancePanel';
import AiReplyDraft from '../components/AiReplyDraft';
import AiKbRecommendations from '../components/AiKbRecommendations';
import ConversationThread from '../components/ConversationThread';
import CustomerCard from '../components/CustomerCard';
import TicketInfoCard from '../components/TicketInfoCard';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import AccessDenied from '../../../components/AccessDenied/AccessDenied';
import styles from './TicketDetailPage.module.css';

function formatHeaderDateTime(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeFormatted = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `Created ${dateFormatted} at ${timeFormatted}`;
  } catch {
    return dateStr;
  }
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const { role } = useAuth();
  const isStaff = role === 'AGENT' || role === 'ADMIN';

  const { data: ticket, isLoading, isError, error } = useTicket(id);
  const [draftToUse, setDraftToUse] = useState('');

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" label="Loading ticket details..." />
      </div>
    );
  }

  if (isError) {
    const status = error?.response?.status;
    if (status === 403) {
      return (
        <AccessDenied
          title="Access restricted"
          message="You do not have permission to view this ticket."
          returnPath="/tickets"
        />
      );
    }
    return (
      <div className={styles.errorContainer}>
        <h3>Unable to load ticket</h3>
        <p>{error?.response?.data?.message || error?.message || 'Ticket not found or network error.'}</p>
        <Link to="/tickets" className={styles.backLink}>← Return to tickets</Link>
      </div>
    );
  }

  if (!ticket) return null;

  const ticketCode = formatTicketId(ticket.id);
  const dateMeta = formatHeaderDateTime(ticket.created_at);
  const channel = ticket.source || 'Email';

  return (
    <div className={styles.pageContainer} aria-label="Ticket Details">
      {/* Top Header */}
      <div className={styles.topHeader}>
        <div className={styles.headerLeft}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link to="/tickets" className={styles.breadcrumbLink}>Tickets</Link>
            <span className={styles.breadcrumbDivider}>/</span>
            <span className={styles.breadcrumbCurrent}>{ticketCode}</span>
          </nav>
          <h1 className={styles.subjectTitle}>{ticket.title}</h1>
          <p className={styles.metaSubtext}>
            {ticketCode} · {dateMeta} · {channel}
          </p>
        </div>

        <div className={styles.headerRight}>
          <Link
            to={`/tickets/${ticket.id}/edit`}
            className={styles.editButton}
          >
            Edit ticket
          </Link>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className={styles.columnsGrid}>
        {/* Left Column: Context & AI assistance */}
        <aside className={styles.leftColumn}>
          <TicketContextCard ticket={ticket} />

          {/* AI Assistance and AI Reply Draft are for Staff only */}
          {isStaff && (
            <>
              <AiAssistancePanel ticket={ticket} />
              <AiReplyDraft
                ticket={ticket}
                onUseDraft={(draft) => setDraftToUse(draft)}
              />
              <AiKbRecommendations ticket={ticket} />
            </>
          )}
        </aside>

        {/* Middle Column: Conversation & Composer */}
        <main className={styles.middleColumn}>
          <ConversationThread
            ticket={ticket}
            draftText={draftToUse}
            onDraftCleared={() => setDraftToUse('')}
          />
        </main>

        {/* Right Column: Customer & Ticket info */}
        <aside className={styles.rightColumn}>
          <CustomerCard ticket={ticket} />
          <TicketInfoCard ticket={ticket} />
        </aside>
      </div>
    </div>
  );
}
