import { useMemo, useState } from 'react';
import KpiCard from '../components/KpiCard/KpiCard';
import PriorityDonut from '../components/PriorityDonut/PriorityDonut';
import ActivityList from '../components/ActivityList/ActivityList';
import TeamTable from '../components/TeamTable/TeamTable';
import TicketVolumeChart from '../components/TicketVolumeChart/TicketVolumeChart';
import DateRangePicker from '../components/DateRangePicker/DateRangePicker';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/Icon/Icon';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import { useAuth } from '../../auth/hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import timeAgo from '../../../utils/relativeTime';
import { getErrorMessage, isForbiddenError } from '../../../utils/errorHandler';
import AccessDenied from '../../../components/AccessDenied/AccessDenied';
import getInitials from '../utils/initials';
import {
  formatDuration,
  formatTicketId,
  formatVolumeRows,
} from '../utils/formatters';
import { buildDashboardCsv, downloadCsv } from '../utils/exportDashboard';
import STATUS_LABELS from '../constants/dashboardDisplay';
import styles from './DashboardPage.module.css';

const RECENT_LIMIT = 5;
const TEAM_ROW_LIMIT = 5;

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

const truncate = (text, max = 56) => {
  if (!text) return '';
  const flat = String(text).replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
};

/**
 * Map one backend recent_tickets row → ActivityList item shape.
 */
const mapTicketToRecent = (ticket, index) => {
  if (!ticket || typeof ticket !== 'object') return null;

  const customerName = ticket.customer?.name || 'Unknown customer';
  return {
    id:          ticket.id ?? index,
    actor:       customerName,
    action:      'created',
    ticketId:    formatTicketId(ticket.id),
    subtitle:    truncate(ticket.title),
    status:      ticket.status,
    statusLabel: STATUS_LABELS[ticket.status] || ticket.status,
    time:        timeAgo(ticket.created_at) ?? '',
    avatar:      getInitials(customerName),
    avatarType:  'text',
  };
};

export default function DashboardPage() {
  const { user, role } = useAuth();

  // ── Date range filter (YYYY-MM-DD strings, UTC) ───────────────────────────
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // ── Recent-tickets pagination ─────────────────────────────────────────────
  const [page, setPage] = useState(1);

  const filters = useMemo(() => {
    const f = { page, limit: RECENT_LIMIT };
    if (startDate) f.startDate = startDate;
    if (endDate)   f.endDate   = endDate;
    return f;
  }, [page, startDate, endDate]);

  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useDashboard(filters);

  const greetingTitle = getGreeting(user?.name);

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

  // Real seven-day (or date-ranged) created/resolved series from the backend
  const volumeRows = useMemo(
    () => formatVolumeRows(dashboard?.ticket_volume),
    [dashboard],
  );

  const effectiveRole = dashboard?.role ?? role;

  // ── Date range handler: reset page on new filter ──────────────────────────
  const handleDateChange = ({ startDate: s, endDate: e }) => {
    setStartDate(s);
    setEndDate(e);
    setPage(1); // reset to page 1 when the date window changes
  };

  // ── Pagination values ─────────────────────────────────────────────────────
  const pagination    = dashboard?.pagination ?? {};
  const totalPages    = Number(pagination.total_pages) || 0;
  const totalItems    = Number(pagination.total_items) || 0;
  const currentPage   = Number(pagination.page) || page;

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
    if (isError && isForbiddenError(error)) {
      return (
        <main className="dashboard-content" aria-label="Dashboard">
          <AccessDenied featureName="the dashboard" role={role} />
        </main>
      );
    }

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
  const rawRecent     = Array.isArray(dashboard.recent_tickets) ? dashboard.recent_tickets : [];
  const recentTickets = rawRecent.slice(0, RECENT_LIMIT);

  const isAdmin       = effectiveRole === 'ADMIN';
  const agentWorkload = Array.isArray(dashboard.agent_workload) ? dashboard.agent_workload : [];
  const teamRows      = agentWorkload.slice(0, TEAM_ROW_LIMIT);
  const teamTitle     = agentWorkload.length > TEAM_ROW_LIMIT
    ? `Team performance · top ${TEAM_ROW_LIMIT}`
    : 'Team performance';

  // KPI cards — every value comes from the scoped dashboard payload.
  const kpiCards = [
    {
      key: 'open',
      label: 'Open tickets',
      value: statusCounts.OPEN ?? 0,
      context: 'Current backlog',
    },
    ...(effectiveRole === 'AGENT'
      ? []
      : [{
          key: 'unassigned',
          label: 'Unassigned',
          value: dashboard.unassigned_count ?? 0,
          context: 'Open or in progress',
        }]),
    {
      key: 'in_prog',
      label: 'In progress',
      value: statusCounts.IN_PROGRESS ?? 0,
      context: 'Currently being worked',
    },
    {
      key: 'resolved',
      label: 'Resolved',
      value: statusCounts.RESOLVED ?? 0,
      context: 'Current resolved state',
    },
    ...(effectiveRole === 'AGENT'
      ? [{
          key: 'closed',
          label: 'Closed tickets',
          value: statusCounts.CLOSED ?? 0,
          context: 'Completed tickets',
        }]
      : []),
    {
      key: 'first_resp',
      label: 'Avg. first response',
      value: formatDuration(dashboard.avg_first_response_hours),
      context: 'First non-customer reply',
    },
    {
      key: 'avg_resolution',
      label: 'Avg. resolution',
      value: formatDuration(dashboard.avg_resolution_hours),
      context: 'Created to resolved',
    },
  ];

  const handleExport = () => {
    const csv = buildDashboardCsv(dashboard);
    if (!csv) return;
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(csv, `dashboard-${String(effectiveRole).toLowerCase()}-${date}.csv`);
  };

  // Volume chart: when fetching fresh data show skeleton only on the chart
  const chartIsLoading = isFetching && !volumeRows.length;
  const hasDateFilter = !!(startDate || endDate);
  const volumeEmptyText = hasDateFilter
    ? 'No ticket activity in the selected date range.'
    : 'No ticket activity in this 7-day window.';

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
          {/* Date range picker — restored and connected to the API */}
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
          />

          <button
            type="button"
            className="btn-export"
            aria-label="Export dashboard data as CSV"
            onClick={handleExport}
          >
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
            footnote={card.context}
          />
        ))}
      </section>

      {/* ── Row 2: Ticket Volume + Priority Donut ──────────────────────── */}
      <section className="dashboard-grid-row" aria-label="Volume and Priority">
        <TicketVolumeChart
          data={volumeRows}
          isLoading={chartIsLoading}
          emptyText={volumeEmptyText}
        />
        <PriorityDonut
          data={priorityItems}
          centerLabel="tickets"
          emptyText={RECENT_EMPTY_TEXTS[effectiveRole]}
        />
      </section>

      {/* ── Row 3: Recent Tickets + Team Performance ───────────────────── */}
      <section
        className={`dashboard-grid-row ${isAdmin ? '' : styles.singleColumn}`}
        aria-label="Recent tickets and team"
      >
        <ActivityList
          data={recentTickets.map(mapTicketToRecent).filter(Boolean)}
          title="Recent tickets"
          emptyText={RECENT_EMPTY_TEXTS[effectiveRole]}
        />
        {isAdmin && (
          <TeamTable
            data={teamRows}
            title={teamTitle}
            emptyText="No agents registered yet."
            isLoading={isFetching && !agentWorkload.length}
          />
        )}
      </section>

      {/* ── Pagination for recent tickets ───────────────────────────────── */}
      {totalPages > 1 && (
        <div
          className={styles.paginationBar}
          aria-label="Recent tickets pagination"
        >
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages} · {recentTickets.length} of {totalItems} tickets
          </span>
          <div className={styles.pageControls}>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1 || isFetching}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <Icon name="chevron-left" size={14} />
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages || isFetching}
              onClick={() => setPage((prev) => prev + 1)}
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
