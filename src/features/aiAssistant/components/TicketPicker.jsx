import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTicket, useTickets } from '../../tickets/hooks/useTickets';
import { TICKET_STATUSES } from '../../tickets/services/ticketService';
import StatusPill from '../../../components/StatusPill/StatusPill';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/Icon/Icon';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from '../AiAssistantPage.module.css';

/**
 * Ticket selection for the AI Assistant. Reuses the existing role-scoped
 * ticket list hook (features/tickets) — no new API was added; the backend
 * list stays the source of truth (customers see only their tickets, agents
 * only their assigned ones). A short client-side search filters the loaded
 * page, and the chosen ticket's full snapshot is shown before any AI action
 * runs (via the existing useTicket detail hook, cached by React Query).
 */

const PAGE_SIZE = 25;
const DESCRIPTION_PREVIEW = 90;

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

const truncate = (text, max = DESCRIPTION_PREVIEW) => {
  if (!text) return '';
  const flat = String(text).replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export default function TicketPicker({ selectedTicketId, onSelectTicket }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      sort: 'updated_at',
      order: 'desc',
      page,
      limit: PAGE_SIZE,
      status: statusFilter || undefined,
    }),
    [statusFilter, page]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useTickets(filters);

  const tickets = useMemo(() => data?.tickets ?? [], [data]);
  const pagination = data?.pagination ?? {};
  const totalPages = Number(pagination.total_pages) || 0;
  const currentPage = Number(pagination.page) || page;
  const totalItems = Number(pagination.total_items) || tickets.length;

  // Full current snapshot of the ticket selected for AI actions (existing
  // detail hook; React Query serves it from cache — no extra endpoint).
  const { data: selectedDetail } = useTicket(selectedTicketId);
  const selectedTicket =
    selectedDetail ??
    tickets.find((ticket) => String(ticket.id) === String(selectedTicketId)) ??
    null;

  const searchQuery = search.trim().toLowerCase();
  const visibleTickets = useMemo(() => {
    if (!searchQuery) return tickets;
    const bare = searchQuery.replace(/^#/, '');
    return tickets.filter(
      (ticket) =>
        String(ticket.id).includes(bare) ||
        (ticket.title || '').toLowerCase().includes(searchQuery) ||
        (ticket.description || '').toLowerCase().includes(searchQuery)
    );
  }, [tickets, searchQuery]);

  return (
    <section className={styles.pickerSection} aria-label="Ticket selection">
      <div className={styles.pickerHead}>
        <div className={styles.pickerHeadText}>
          <h2 className={styles.sectionTitle}>Select a ticket</h2>
          <p className={styles.sectionSub}>
            AI actions run against the ticket selected here. Suggestions are
            advisory only — nothing is applied automatically.
          </p>
        </div>
        <div className={styles.pickerControls}>
          <div className={styles.pickerSearch}>
            <Icon name="search" size={15} className={styles.pickerSearchIcon} />
            <input
              type="text"
              className={styles.pickerInput}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, description or #id"
              aria-label="Search tickets"
            />
          </div>
          <select
            className={styles.pickerStatusSelect}
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status] || status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.pickerSkeleton} aria-hidden="true">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className={styles.skeletonRow}>
              <span className={`${styles.skeletonLine} ${styles.skeletonId}`} />
              <span className={styles.skeletonMain}>
                <span className={styles.skeletonLine} />
                <span className={`${styles.skeletonLine} ${styles.skeletonShort}`} />
              </span>
              <span className={`${styles.skeletonLine} ${styles.skeletonPill}`} />
              <span className={`${styles.skeletonLine} ${styles.skeletonPill}`} />
              <span className={`${styles.skeletonLine} ${styles.skeletonMeta}`} />
            </div>
           ))}
        </div>
      ) : isError ? (
        <div className={styles.errorBanner} role="alert">
          <div className={styles.errorLeft}>
            <Icon name="alert-circle" size={18} />
            <span>{getErrorMessage(error)}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : visibleTickets.length === 0 ? (
        <div className={styles.pickerEmpty}>
          <Icon name="ticket" size={30} className={styles.pickerEmptyIcon} />
          <h3 className={styles.pickerEmptyTitle}>
            {searchQuery || statusFilter ? 'No tickets match' : 'No tickets yet'}
          </h3>
          <p className={styles.pickerEmptyText}>
            {searchQuery || statusFilter
              ? 'Try a different search term or clear the status filter.'
              : 'Once tickets exist for your account, pick one here to run AI actions on it.'}
          </p>
        </div>
      ) : (
        <ul className={styles.ticketRows}>
          {visibleTickets.map((ticket) => {
            const isSelected = String(ticket.id) === String(selectedTicketId ?? '');

            return (
              <li key={ticket.id}>
                <button
                  type="button"
                  className={`${styles.ticketRow}${isSelected ? ` ${styles.ticketRowSelected}` : ''}`}
                  aria-pressed={isSelected}
                  onClick={() => onSelectTicket(ticket.id)}
                >
                  <span className={styles.rowTop}>
                    <span className={styles.rowId}>#{ticket.id}</span>
                    <StatusPill
                      status={ticket.status}
                      label={STATUS_LABELS[ticket.status] || ticket.status}
                    />
                  </span>
                  <span className={styles.rowMain}>
                    <span className={styles.rowTitle}>{ticket.title}</span>
                    {ticket.description && (
                      <span className={styles.rowDesc}>
                        {truncate(ticket.description)}
                      </span>
                    )}
                  </span>
                  <span className={styles.rowBottom}>
                    <StatusPill
                      status={ticket.priority}
                      label={PRIORITY_LABELS[ticket.priority] || ticket.priority}
                    />
                    <span className={styles.rowCategory}>
                      {ticket.category?.name || '—'}
                    </span>
                    <span className={styles.rowDate}>
                      {formatDate(ticket.created_at)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Selected ticket snapshot — shown before any AI action is triggered */}
      {selectedTicket && (
        <div className={styles.selectedBox}>
          <div className={styles.selectedKicker}>
            <span
              className={styles.selectedCheck}
              aria-hidden="true"
            >
              <Icon name="check" size={12} strokeWidth={2.5} />
            </span>
            <span>Selected ticket</span>
          </div>

          <div className={styles.selHead}>
            <div className={styles.selHeadMain}>
              <span className={styles.selId}>#{selectedTicket.id}</span>
              <h3 className={styles.selTitle}>{selectedTicket.title}</h3>
              <div className={styles.selPills}>
                <StatusPill
                  status={selectedTicket.status}
                  label={STATUS_LABELS[selectedTicket.status] || selectedTicket.status}
                />
                <StatusPill
                  status={selectedTicket.priority}
                  label={PRIORITY_LABELS[selectedTicket.priority] || selectedTicket.priority}
                />
              </div>
            </div>
            <Link
              to={`/tickets/${selectedTicket.id}`}
              className={styles.selLink}
            >
              Open full ticket
              <Icon name="chevron-right" size={13} />
            </Link>
          </div>

          {selectedTicket.description && (
            <p className={styles.selDesc}>
              {truncate(selectedTicket.description, 200)}
            </p>
          )}

          <dl className={styles.selMetaGrid}>
            <div className={styles.selMetaItem}>
              <dt className={styles.selMetaLabel}>Customer</dt>
              <dd className={styles.selMetaValue}>
                {selectedTicket.customer?.name || '—'}
              </dd>
            </div>
            <div className={styles.selMetaItem}>
              <dt className={styles.selMetaLabel}>Category</dt>
              <dd className={styles.selMetaValue}>
                {selectedTicket.category?.name || '—'}
              </dd>
            </div>
            <div className={styles.selMetaItem}>
              <dt className={styles.selMetaLabel}>Assigned agent</dt>
              <dd className={styles.selMetaValue}>
                {selectedTicket.assigned_agent?.name || 'Unassigned'}
              </dd>
            </div>
            <div className={styles.selMetaItem}>
              <dt className={styles.selMetaLabel}>Created</dt>
              <dd className={styles.selMetaValue}>
                {formatDate(selectedTicket.created_at)}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Pagination (reuses the same list endpoint; shown when more pages exist) */}
      {!isLoading && !isError && visibleTickets.length > 0 && totalPages > 1 && (
        <div className={styles.pickerPagination}>
          <span className={styles.pageInfoText}>
            Page {currentPage} of {totalPages} · {totalItems} tickets
          </span>
          <div className={styles.pageControls}>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <Icon name="chevron-left" size={14} />
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
              <Icon name="chevron-right" size={14} />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
