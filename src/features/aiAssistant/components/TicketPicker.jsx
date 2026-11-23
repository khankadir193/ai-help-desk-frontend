import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/axios';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { useAuth } from '../../auth/hooks/useAuth';
import StatusPill from '../../../components/StatusPill/StatusPill';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/Icon/Icon';
import AccessDenied from '../../../components/AccessDenied/AccessDenied';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from './TicketPicker.module.css';

const PAGE_SIZE = 50;

const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

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

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export default function TicketPicker({ selectedTicketId, onSelectTicket }) {
  const { role } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const listRef = useRef(null);

  // 300ms debounce for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Query params for backend ticket listing
  const filters = useMemo(
    () => ({
      sort: 'created_at',
      order: 'desc',
      page,
      limit: PAGE_SIZE,
      status: statusFilter || undefined,
      search: debouncedSearch.trim() || undefined,
    }),
    [statusFilter, debouncedSearch, page]
  );

  // Fetch tickets with TanStack Query and wire the real AbortSignal to Axios
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ai-assistant', 'picker-tickets', filters],
    queryFn: async ({ signal }) => {
      const params = {
        sort: filters.sort,
        order: filters.order,
        page: String(filters.page),
        limit: String(filters.limit),
      };
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const response = await apiClient.get(API_ENDPOINTS.TICKETS.BASE, {
        params,
        signal,
      });

      return {
        tickets: response?.data?.tickets ?? response?.tickets ?? [],
        pagination: response?.data?.pagination ?? response?.pagination ?? {
          page: 1,
          limit: PAGE_SIZE,
          total_items: 0,
          total_pages: 0,
        },
      };
    },
    placeholderData: (previous) => previous,
  });

  const tickets = useMemo(() => data?.tickets ?? [], [data]);
  const pagination = data?.pagination ?? {};
  const totalPages = Number(pagination.total_pages) || 0;
  const currentPage = Number(pagination.page) || page;
  const totalItems = Number(pagination.total_items) || tickets.length;

  // Client-side search matching against ID, title, and description
  const searchQuery = debouncedSearch.trim().toLowerCase();
  const visibleTickets = useMemo(() => {
    if (!searchQuery) return tickets;
    const bare = searchQuery.replace(/^#/, '');
    return tickets.filter((ticket) => {
      const matchId = String(ticket.id).includes(bare);
      const matchTitle = (ticket.title || '').toLowerCase().includes(searchQuery);
      const matchDesc = (ticket.description || '').toLowerCase().includes(searchQuery);
      return matchId || matchTitle || matchDesc;
    });
  }, [tickets, searchQuery]);

  // Arrow key navigation between ticket rows
  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const buttons = listRef.current?.querySelectorAll('button[role="option"]');
      if (buttons && buttons[index + 1]) {
        buttons[index + 1].focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const buttons = listRef.current?.querySelectorAll('button[role="option"]');
      if (buttons && buttons[index - 1]) {
        buttons[index - 1].focus();
      }
    }
  };

  // 403 Forbidden check
  if (isError && (error?.status === 403 || error?.response?.status === 403)) {
    return <AccessDenied role={role} featureName="assigned tickets" />;
  }

  return (
    <div className={styles.container}>
      {/* 1. Compact Intro Card */}
      <section className={styles.introCard} aria-labelledby="intro-card-title">
        <div className={styles.introIconCircle} aria-hidden="true">
          <Icon name="sparkle" size={20} strokeWidth={2.2} />
        </div>
        <div className={styles.introText}>
          <h2 id="intro-card-title" className={styles.introTitle}>
            Select a ticket to begin
          </h2>
          <p className={styles.introDescription}>
            Choose an assigned ticket below to inspect AI suggestions, review drafted responses, and resolve customer requests with full control.
          </p>
        </div>
      </section>

      {/* 2. Select a Ticket Card */}
      <section className={styles.pickerCard} aria-labelledby="picker-card-title">
        <div className={styles.pickerHeader}>
          <h2 id="picker-card-title" className={styles.pickerTitle}>
            Select a ticket
          </h2>
          <p className={styles.pickerNote}>
            AI actions run against the ticket selected here. Suggestions are advisory only — nothing is applied automatically.
          </p>
        </div>

        {/* Filter Row: Search Input + Status Dropdown */}
        <div className={styles.filterRow}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">
              <Icon name="search" size={16} />
            </span>
            <input
              type="text"
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description or #ID"
              aria-label="Search title, description or #ID"
            />
            {search && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearch('')}
                aria-label="Clear search text"
              >
                <Icon name="x" size={12} />
              </button>
            )}
          </div>

          <div className={styles.filterRight}>
            <select
              className={styles.statusSelect}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {TICKET_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status] || status}
                </option>
              ))}
            </select>

            <span className={styles.resultCount} aria-live="polite">
              {isLoading
                ? 'Loading…'
                : `${visibleTickets.length} ${visibleTickets.length === 1 ? 'ticket' : 'tickets'}`}
            </span>
          </div>
        </div>

        {/* Ticket List States: Skeleton, Error, Empty, or List */}
        {isLoading ? (
          <div className={styles.skeletonList} aria-busy="true" aria-label="Loading tickets">
            {[0, 1, 2, 3, 4].map((idx) => (
              <div key={idx} className={styles.skeletonRow}>
                <div className={styles.skeletonLine1}>
                  <div className={styles.skeletonLeft}>
                    <span className={`${styles.shimmer} ${styles.skeletonId}`} />
                    <span className={`${styles.shimmer} ${styles.skeletonTitle}`} />
                  </div>
                  <div className={styles.skeletonPills}>
                    <span className={`${styles.shimmer} ${styles.skeletonPill}`} />
                    <span className={`${styles.shimmer} ${styles.skeletonPill}`} />
                  </div>
                </div>
                <div className={styles.skeletonLine2}>
                  <div className={styles.skeletonDescWrap}>
                    <span className={`${styles.shimmer} ${styles.skeletonDesc}`} />
                    <span className={`${styles.shimmer} ${styles.skeletonCategory}`} />
                  </div>
                  <span className={`${styles.shimmer} ${styles.skeletonDate}`} />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className={styles.errorBox} role="alert">
            <div className={styles.errorContent}>
              <Icon name="alert-circle" size={18} className={styles.errorIcon} />
              <span className={styles.errorText}>
                {getErrorMessage(error) || 'Failed to load tickets.'}
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : visibleTickets.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconCircle}>
              <Icon name="ticket" size={24} />
            </div>
            <h3 className={styles.emptyTitle}>
              {searchQuery || statusFilter ? 'No tickets match your search' : 'No tickets assigned'}
            </h3>
            <p className={styles.emptyText}>
              {searchQuery || statusFilter
                ? 'Try a different keyword or clear the status filter.'
                : 'There are currently no tickets available for your account.'}
            </p>
            {(searchQuery || statusFilter) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div
            ref={listRef}
            className={`${styles.ticketList} ${isFetching && !isLoading ? styles.dimmed : ''}`}
            role="listbox"
            aria-label="Available tickets"
          >
            {visibleTickets.map((ticket, idx) => {
              const isSelected = String(ticket.id) === String(selectedTicketId ?? '');
              const categoryName = ticket.category?.name;

              return (
                <button
                  key={ticket.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.ticketRow}${isSelected ? ` ${styles.ticketRowSelected}` : ''}`}
                  onClick={() => onSelectTicket(ticket.id)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  aria-label={`Select ticket #${ticket.id}: ${ticket.title}`}
                >
                  {/* Line 1: Tabular ID, Title, Status & Priority Pills */}
                  <div className={styles.rowLine1}>
                    <div className={styles.rowLeft}>
                      <span className={styles.ticketId}>#{ticket.id}</span>
                      <span className={styles.ticketTitle} title={ticket.title}>
                        {ticket.title}
                      </span>
                    </div>
                    <div className={styles.rowRightPills}>
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

                  {/* Line 2: Description, Category Tooltip, Date */}
                  <div className={styles.rowLine2}>
                    <div className={styles.rowDescWrapper}>
                      <span className={styles.ticketDesc} title={ticket.description}>
                        {ticket.description || 'No description provided.'}
                      </span>
                      {categoryName && (
                        <span className={styles.categoryBadge} title={categoryName}>
                          {categoryName}
                        </span>
                      )}
                    </div>
                    <span className={styles.ticketDate}>
                      {formatDate(ticket.created_at)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination controls for multi-page ticket sets */}
        {!isLoading && !isError && visibleTickets.length > 0 && totalPages > 1 && (
          <div className={styles.paginationRow}>
            <span className={styles.paginationText}>
              Page {currentPage} of {totalPages} · {totalItems} tickets
            </span>
            <div className={styles.paginationButtons}>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <Icon name="chevron-left" size={14} />
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <Icon name="chevron-right" size={14} />
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
