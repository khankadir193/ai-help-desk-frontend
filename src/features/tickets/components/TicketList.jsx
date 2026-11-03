import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCategories } from '../../categories/hooks/useCategories';
import { TICKET_STATUSES, TICKET_PRIORITIES } from '../services/ticketService';
import StatusPill from '../../../components/StatusPill/StatusPill';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/Icon/Icon';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import CreateTicketModal from './CreateTicketModal';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from './TicketList.module.css';

const PAGE_SIZE = 10;

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

const SCOPE_DESCRIPTIONS = {
  CUSTOMER: 'Track the status of the support requests you have submitted.',
  AGENT: 'Work through the tickets currently assigned to you.',
  ADMIN: 'Monitor and triage every ticket across the help desk.',
};

const truncate = (text, max = 60) => {
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

export default function TicketList() {
  const { role } = useAuth();

  // Filter state — status, priority, category are enforced server-side
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Create ticket modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Backend supports these filters for every authenticated role
  const filters = useMemo(
    () => ({
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      category_id: categoryFilter || undefined,
      sort: 'created_at',
      order,
      page,
      limit: PAGE_SIZE,
    }),
    [statusFilter, priorityFilter, categoryFilter, order, page]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useTickets(filters);

  const tickets = data?.tickets ?? [];
  // Normalized once here — the component must never assume pagination
  // metadata exists on `data` (server returns it on 200, but React Query
  // renders with no/partial data during initial load, errors, or placeholder
  // restore from cache, and trains with any envelope drift).
  const pagination = data?.pagination ?? {};
  const itemsPerPage = Number(pagination.limit) || PAGE_SIZE;

  // Category filter options: admins may filter by inactive categories too
  const isAdmin = role === 'ADMIN';
  const { data: categories = [] } = useCategories({
    isActive: isAdmin ? undefined : true,
  });

  const showToast = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage((prev) => (prev === message ? '' : prev));
    }, 4500);
  };

  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  // Pagination totals with safe fallbacks so a response without metadata
  // (or an inconsistent one) can never crash the render.
  const totalItems = Number(pagination.total_items) || tickets.length;
  const totalPages =
    Number(pagination.total_pages) ||
    (totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : 0);
  const currentPage = Number(pagination.page) || page;
  const rangeStart =
    totalItems === 0 || tickets.length === 0
      ? 0
      : (currentPage - 1) * itemsPerPage + 1;
  const rangeEnd = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={styles.container}>
      {/* Toast Notification */}
      {successMessage && (
        <div className={styles.successToast} role="status">
          <div className={styles.successToastLeft}>
            <Icon name="check-circle" size={18} />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            className={styles.toastCloseBtn}
            onClick={() => setSuccessMessage('')}
            aria-label="Dismiss notification"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      )}

      <div className={styles.card}>
        {/* Header Row */}
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <h2 className={styles.title}>
              <span>Support Tickets</span>
              {!isLoading && !!totalItems && (
                <span className={styles.badgeCount}>
                  {totalItems} {totalItems === 1 ? 'ticket' : 'tickets'}
                </span>
              )}
            </h2>
            <p className={styles.subtext}>{SCOPE_DESCRIPTIONS[role] || 'Browse tickets.'}</p>
          </div>

          <div className={styles.actionsArea}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => refetch()}
              title="Refresh tickets"
              aria-label="Refresh tickets"
              disabled={isFetching}
            >
              <Icon name="rotate-cw" size={16} className={isFetching ? 'spin' : ''} />
            </button>

            {role === 'CUSTOMER' && (
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Icon name="plus" size={16} strokeWidth={2.5} />
                <span>New Ticket</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter Bar (server-supported filters only) */}
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <label htmlFor="ticket-status-filter" className={styles.filterLabel}>
              Status
            </label>
            <select
              id="ticket-status-filter"
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => changeFilter(setStatusFilter)(e.target.value)}
            >
              <option value="">All</option>
              {TICKET_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status] || status}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="ticket-priority-filter" className={styles.filterLabel}>
              Priority
            </label>
            <select
              id="ticket-priority-filter"
              className={styles.filterSelect}
              value={priorityFilter}
              onChange={(e) => changeFilter(setPriorityFilter)(e.target.value)}
            >
              <option value="">All</option>
              {TICKET_PRIORITIES.map((level) => (
                <option key={level} value={level}>
                  {PRIORITY_LABELS[level] || level}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="ticket-category-filter" className={styles.filterLabel}>
              Category
            </label>
            <select
              id="ticket-category-filter"
              className={styles.filterSelect}
              value={categoryFilter}
              onChange={(e) => changeFilter(setCategoryFilter)(e.target.value)}
            >
              <option value="">All</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="ticket-order-filter" className={styles.filterLabel}>
              Sort
            </label>
            <select
              id="ticket-order-filter"
              className={styles.filterSelect}
              value={order}
              onChange={(e) => changeFilter(setOrder)(e.target.value)}
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>
        </div>

        {/* Content States */}
        {isLoading ? (
          <div className={styles.stateBox}>
            <Spinner size="lg" label="Loading tickets..." />
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
        ) : tickets.length === 0 ? (
          <div className={styles.stateBox}>
            <Icon name="ticket" size={36} className={styles.stateIcon} />
            <h3 className={styles.stateTitle}>No tickets found</h3>
            <p className={styles.stateText}>
              {statusFilter || priorityFilter || categoryFilter
                ? 'No tickets match the selected filters. Try clearing a filter.'
                : role === 'CUSTOMER'
                ? 'You have not submitted any support tickets yet.'
                : 'There are no tickets to show right now.'}
            </p>
            {(statusFilter || priorityFilter || categoryFilter) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setStatusFilter('');
                  setPriorityFilter('');
                  setCategoryFilter('');
                  setOrder('desc');
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Tickets Table */}
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th} style={{ width: '40%' }}>
                      Ticket
                    </th>
                    <th className={styles.th} style={{ width: '12%' }}>
                      Status
                    </th>
                    <th className={styles.th} style={{ width: '10%' }}>
                      Priority
                    </th>
                    <th className={styles.th} style={{ width: '16%' }}>
                      Category
                    </th>
                    {role !== 'CUSTOMER' && (
                      <th className={styles.th} style={{ width: '14%' }}>
                        Assigned Agent
                      </th>
                    )}
                    <th className={styles.th} style={{ width: '12%' }}>
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className={styles.tr}>
                      <td className={styles.td}>
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className={styles.ticketLink}
                        >
                          <span className={styles.ticketTitle}>
                            {ticket.title}
                          </span>
                          <span className={styles.ticketDesc}>
                            {truncate(ticket.description)}
                          </span>
                        </Link>
                      </td>

                      <td className={styles.td}>
                        <StatusPill
                          status={ticket.status}
                          label={STATUS_LABELS[ticket.status] || ticket.status}
                        />
                      </td>

                      <td className={styles.td}>
                        <StatusPill
                          status={ticket.priority}
                          label={PRIORITY_LABELS[ticket.priority] || ticket.priority}
                        />
                      </td>

                      <td className={styles.td}>
                        <span className={styles.categoryCell}>
                          {ticket.category?.name || '—'}
                        </span>
                      </td>

                      {role !== 'CUSTOMER' && (
                        <td className={styles.td}>
                          <span className={styles.agentCell}>
                            {ticket.assigned_agent?.name || 'Unassigned'}
                          </span>
                        </td>
                      )}

                      <td className={`${styles.td} ${styles.dateCell}`}>
                        {formatDate(ticket.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {tickets.length > 0 && totalItems > 0 && totalPages > 0 && (
              <div className={styles.paginationBar}>
                <span className={styles.pageInfo}>
                  {rangeStart}–{rangeEnd} of {totalItems} tickets
                </span>
                <div className={styles.pageControls}>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    <Icon name="chevron-left" size={14} />
                    Previous
                  </Button>
                  <span className={styles.pageIndicator}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= totalPages || isFetching}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Next
                    <Icon name="chevron-right" size={14} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Ticket Modal (Customer) */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={showToast}
      />
    </div>
  );
}
