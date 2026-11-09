import { useMemo, useState } from 'react';
import KpiCard from '../components/KpiCard/KpiCard';
import PriorityDonut from '../components/PriorityDonut/PriorityDonut';
import ActivityList from '../components/ActivityList/ActivityList';
import TeamTable from '../components/TeamTable/TeamTable';
import TicketVolumeChart from '../components/TicketVolumeChart/TicketVolumeChart';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/Icon/Icon';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import { useAuth } from '../../auth/hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import timeAgo from '../../../utils/relativeTime';
import { getErrorMessage } from '../../../utils/errorHandler';
import getInitials from '../utils/initials';
import STATUS_LABELS from '../constants/dashboardDisplay';
import styles from './DashboardPage.module.css';

const RECENT_PAGE_SIZE = 5;

const PRIORITY_ITEMS = [
  { key: 'URGENT', label: 'Urgent', color: 'var(--color-danger)' },
  { key: 'HIGH',   label: 'High',   color: 'var(--color-amber)' },
  { key: 'MEDIUM', label: 'Medium', color: 'var(--color-blue)' },
  { key: 'LOW',    label: 'Low',    color: 'var(--color-slate)' },
];

const ROLE_SUBTEXTS = {
  ADMIN:    "Here's what's happening across support today.",
  AGENT:    "Here's what's happening across your assigned tickets.",
  CUSTOMER: "Here's an overview of your support requests.",
};

const RECENT_EMPTY_TEXTS = {
  ADMIN:    'No tickets in the system yet.',
  AGENT:    'No tickets are assigned to you yet.',
  CUSTOMER: "You haven't submitted any support tickets yet.",
};

/** Time-of-day greeting using the signed-in user's first name */
const getGreeting = (name) => {
  const hour = new Date().getHours();
  const period =
    hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = name ? name.split(' ')[0] : 'there';
  return `Good ${period}, ${firstName}`;
};

/** Derive a readable action verb from ticket status */
const actionFor = (status) => {
  switch (status) {
    case 'RESOLVED': return 'resolved';
    case 'IN_PROGRESS': return 'is working on';
    case 'CLOSED': return 'closed';
    default: return 'opened';
  }
};

const truncate = (text, max = 60) => {
  if (!text) return '';
  const flat = String(text).replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
};

/** Map one backend recent_tickets row → ActivityList item shape */
const mapTicketToActivity = (ticket, index) => {
  if (!ticket || typeof ticket !== 'object') return null;
  const customerName = ticket.customer?.name;
  const actorName = customerName || ticket.assigned_agent?.name || 'System';
  return {
    id:          ticket.id ?? index,
    actor:       actorName,
    action:      actionFor(ticket.status),
    ticketId:    `TCK-${String(ticket.id).padStart(4, '0')}`,
    subtitle:    truncate(ticket.title),
    status:      ticket.status,
    statusLabel: STATUS_LABELS[ticket.status] || ticket.status,
    time:        timeAgo(ticket.created_at) ?? '',
    avatar:      getInitials(actorName),
    avatarType:  'text',
  };
};

/** Format a date range label — uses today as the end of a 7-day window */
const formatDateRange = () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  const fmt = (d) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${fmt(start)} – ${fmt(now)}`;
};

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [requestedPage, setRequestedPage] = useState(1);

  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useDashboard({ page: requestedPage, limit: RECENT_PAGE_SIZE });

  const pagination   = dashboard?.pagination ?? {};
  const totalPages   = Number(pagination.total_pages) || 0;
  const page         = totalPages > 0 ? Math.min(requestedPage, totalPages) : requestedPage;
  const greetingTitle = getGreeting(user?.name);
  const dateRange    = formatDateRange();

  // Priority donut segments derived from real counts
  const priorityItems = useMemo(
    () =>
      PRIORITY_ITEMS.map((item) => {
        const count = dashboard?.priority_counts?.[item.key] ?? 0;
        const total = dashboard?.total_tickets ?? 0;
        const share = total > 0 ? `${Math.round((count / total) * 100)}%` : '0%';
        return { id: item.key.toLowerCase(), label: item.label, count, color: item.color, percentage: share };
      }),
    [dashboard],
  );

  const effectiveRole = dashboard?.role ?? role;

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading && !dashboard) {
    return (
      <main className="dashboard-content" aria-label="Dashboard">
        <div className={styles.stateBox}>
          <Spinner size="lg" label="Loading dashboard..." />
        </div>
      </main>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (isError || !dashboard) {
    return (
      <main className="dashboard-content" aria-label="Dashboard">
        <div className={styles.stateBox}>
          <Icon name="alert-circle" size={36} className={styles.stateIcon} />
          <h2 className={styles.stateTitle}>Something went wrong</h2>
          <p className={styles.stateText}>
            {isError ? getErrorMessage(error) : 'No dashboard data available.'}
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </main>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const statusCounts  = dashboard.status_counts ?? {};
  const recentTickets = Array.isArray(dashboard.recent_tickets) ? dashboard.recent_tickets : [];
  const totalItems    = Number(pagination.total_items) || 0;
  const currentPage   = Number(pagination.page) || page;

  const isAdmin      = effectiveRole === 'ADMIN';
  const agentWorkload = Array.isArray(dashboard.agent_workload) ? dashboard.agent_workload : [];

  // KPI card definitions — purely from backend data, no hardcoded numbers
  const kpiCards = [
    { key: 'open',       label: 'Open tickets',       value: statusCounts.OPEN ?? 0, },
    { key: 'unassigned', label: 'Unassigned',          value: statusCounts.OPEN ?? 0, },   // proxy: open ~ unassigned
    { key: 'in_prog',    label: 'In progress',         value: statusCounts.IN_PROGRESS ?? 0, },
    { key: 'resolved',   label: 'Resolved',            value: statusCounts.RESOLVED ?? 0, },
    { key: 'closed',     label: 'Closed',              value: statusCounts.CLOSED ?? 0, },
    { key: 'total',      label: 'Total tickets',       value: dashboard.total_tickets ?? 0, },
  ];

  return (
    <main className="dashboard-content">

      {/* ── Greeting Row ───────────────────────────────────────────────── */}
      <section className="greeting-row" aria-label="Overview Header">
        <div className="greeting-row__left">
          <h2 className="greeting-row__title">{greetingTitle}</h2>
          <p className="greeting-row__subtext">
            {ROLE_SUBTEXTS[effectiveRole] || ROLE_SUBTEXTS.CUSTOMER}
          </p>
        </div>

        <div className="greeting-row__actions">
          <button type="button" className="btn-date-range" aria-label="Select date range">
            <Icon name="calendar" size={15} className="btn-date-range__icon" />
            <span>{dateRange}</span>
            <Icon name="chevron-down" size={14} className="btn-date-range__chevron" />
          </button>

          <button type="button" className="btn-export" aria-label="Export data">
            Export
          </button>
        </div>
      </section>

      {/* ── Row 1: KPI Cards ───────────────────────────────────────────── */}
      <section className="kpi-grid" aria-label="Key Performance Indicators">
        {kpiCards.map((card) => (
          <KpiCard
            key={card.key}
            label={card.label}
            value={String(card.value)}
            trend=""
            trendDirection="neutral"
            comparison="vs last 7 days"
          />
        ))}
      </section>

      {/* ── Row 2: Ticket Volume + Priority Donut ──────────────────────── */}
      <section className="dashboard-grid-row" aria-label="Volume and Priority">
        <TicketVolumeChart
          statusCounts={statusCounts}
          isLoading={isFetching && !dashboard}
        />
        <PriorityDonut
          data={priorityItems}
          centerLabel="open"
          emptyText={RECENT_EMPTY_TEXTS[effectiveRole]}
        />
      </section>

      {/* ── Row 3: Recent Activity + Team Performance ──────────────────── */}
      <section className="dashboard-grid-row" aria-label="Activity and Team">
        <ActivityList
          data={recentTickets.map(mapTicketToActivity).filter(Boolean)}
          title="Recent ticket activity"
          emptyText={RECENT_EMPTY_TEXTS[effectiveRole]}
        />
        {isAdmin && (
          <TeamTable
            data={agentWorkload}
            title="Team performance"
            emptyText="No agents registered yet."
            isLoading={isFetching && !dashboard}
          />
        )}
      </section>

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className={styles.paginationBar} aria-label="Recent tickets pagination">
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages} · {recentTickets.length} shown of {totalItems} tickets
          </span>
          <div className={styles.pageControls}>
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setRequestedPage(Math.max(1, page - 1))}
            >
              <Icon name="chevron-left" size={14} />
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => setRequestedPage(page + 1)}
            >
              Next
              <Icon name="chevron-right" size={14} />
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
