import { useState } from 'react';
import KpiCard from '../components/KpiCard/KpiCard';
import PriorityDonut from '../components/PriorityDonut/PriorityDonut';
import ActivityList from '../components/ActivityList/ActivityList';
import TeamTable from '../components/TeamTable/TeamTable';
import CountBreakdownCard from '../components/CountBreakdownCard/CountBreakdownCard';
import Button from '../components/ui/Button/Button';
import Icon from '../components/Icon/Icon';
import Spinner from '../components/feedback/Spinner/Spinner';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useDashboard } from '../features/dashboard/hooks/useDashboard';
import timeAgo from '../utils/relativeTime';
import { getErrorMessage } from '../utils/errorHandler';
import { userProfile } from '../data/dashboardData';
import styles from './DashboardPage.module.css';

const RECENT_PAGE_SIZE = 5;

const STATUS_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

/**
 * Presentation defaults derived from the values the dashboard service
 * actually returns (status_counts / priority_counts enums).
 */
const STATUS_ITEMS = [
  { key: 'OPEN', label: STATUS_LABELS.OPEN },
  { key: 'IN_PROGRESS', label: STATUS_LABELS.IN_PROGRESS },
  { key: 'RESOLVED', label: STATUS_LABELS.RESOLVED },
  { key: 'CLOSED', label: STATUS_LABELS.CLOSED },
];

const PRIORITY_ITEMS = [
  { key: 'URGENT', label: 'Urgent', color: '#DC2626' },
  { key: 'HIGH', label: 'High', color: '#F59E0B' },
  { key: 'MEDIUM', label: 'Medium', color: '#3B82F6' },
  { key: 'LOW', label: 'Low', color: '#94A3B8' },
];

const ROLE_SCOPE_TEXTS = {
  ADMIN: 'all tickets',
  AGENT: 'assigned to you',
  CUSTOMER: 'your tickets',
};

const ROLE_SUBTEXTS = {
  ADMIN: 'System-wide overview of the help desk.',
  AGENT: "Here's what's happening across your assigned tickets.",
  CUSTOMER: "Here's an overview of your support requests.",
};

const RECENT_EMPTY_TEXTS = {
  ADMIN: 'No tickets in the system yet.',
  AGENT: 'No tickets are assigned to you yet.',
  CUSTOMER: "You haven't submitted any support tickets yet.",
};

const getInitials = (name) => {
  const source = typeof name === 'string' ? name.trim() : '';
  if (!source) return 'U';
  const parts = source.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const truncate = (text, max = 60) => {
  if (!text) return '';
  const flat = String(text).replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
};

/** Map backend recent_tickets rows onto the ActivityList item shape. */
const mapRecentToActivity = (tickets) =>
  tickets.map((ticket) => ({
    id: ticket.id,
    actor: ticket.customer?.name || 'Unknown',
    action: 'opened',
    ticketId: `#${ticket.id}`,
    subtitle: truncate(ticket.title),
    status: ticket.status,
    statusLabel: STATUS_LABELS[ticket.status] || ticket.status,
    time: timeAgo(ticket.created_at) ?? '',
    avatar: getInitials(ticket.customer?.name),
    avatarType: 'text',
  }));

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [page, setPage] = useState(1);

  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useDashboard({ page, limit: RECENT_PAGE_SIZE });

  // Dynamic greeting based on current time
  const getGreeting = (name) => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning';
    if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good afternoon';
    } else if (hour >= 17) {
      timeGreeting = 'Good evening';
    }

    const firstName = name ? name.split(' ')[0] : 'there';
    return `${timeGreeting}, ${firstName}`;
  };

  const greetingTitle = getGreeting(user?.name);

  // The backend echoes the authoritative role used to scope the data
  const effectiveRole = dashboard?.role ?? role;
  const scopeText = ROLE_SCOPE_TEXTS[effectiveRole] || 'your tickets';

  if (isLoading && !dashboard) {
    return (
      <main className="dashboard-content" aria-label="Dashboard">
        <div className={styles.stateBox}>
          <Spinner size="lg" label="Loading dashboard..." />
        </div>
      </main>
    );
  }

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

  // Real breakdowns — zero-filled by the backend, so every enum value exists
  const statusItems = STATUS_ITEMS.map((item) => ({
    id: item.key,
    label: item.label,
    count: dashboard.status_counts?.[item.key] ?? 0,
  }));

  const priorityItems = PRIORITY_ITEMS.map((item) => {
    const count = dashboard.priority_counts?.[item.key] ?? 0;
    const share = dashboard.total_tickets > 0
      ? `${Math.round((count / dashboard.total_tickets) * 100)}%`
      : '0%';
    return { id: item.key.toLowerCase(), label: item.label, count, color: item.color, percentage: share };
  });

  const recentTickets = dashboard.recent_tickets ?? [];
  const pagination = dashboard.pagination ?? {};
  const totalPages = Number(pagination.total_pages) || 0;
  const totalItems = Number(pagination.total_items) || 0;
  const currentPage = Number(pagination.page) || page;

  const isAdmin = effectiveRole === 'ADMIN';
  const categoryItems = (dashboard.category_counts ?? []).map((row) => ({
    id: row.category_id ?? 'uncategorized',
    label: row.category_name || 'Uncategorized',
    count: row.count,
  }));

  return (
    <main className="dashboard-content">
      {/* Greeting & Actions Row */}
      <section className="greeting-row" aria-label="Overview Header">
        <div className="greeting-row__left">
          <h2 className="greeting-row__title">{greetingTitle}</h2>
          <p className="greeting-row__subtext">
            {ROLE_SUBTEXTS[effectiveRole] || ROLE_SUBTEXTS.CUSTOMER}
          </p>
        </div>

        <div className="greeting-row__actions">
          <button
            type="button"
            className="btn-date-range"
            aria-label="Filter by date range"
          >
            <Icon
              name="calendar"
              size={15}
              className="btn-date-range__icon"
            />
            <span>{userProfile.dateRange}</span>
            <Icon
              name="chevron-down"
              size={14}
              className="btn-date-range__chevron"
            />
          </button>

          <button
            type="button"
            className="btn-export"
            aria-label="Export dashboard data"
          >
            Export
          </button>
        </div>
      </section>

      {/* Row 1: KPI Cards from server aggregates */}
      <section className="kpi-grid" aria-label="Key Performance Indicators">
        <KpiCard
          label="Total tickets"
          value={String(dashboard.total_tickets ?? 0)}
          trend=""
          trendDirection="neutral"
          comparison={scopeText}
        />
        {STATUS_ITEMS.map((item) => (
          <KpiCard
            key={item.key}
            label={item.label}
            value={String(dashboard.status_counts?.[item.key] ?? 0)}
            trend=""
            trendDirection="neutral"
            comparison={scopeText}
          />
        ))}
      </section>

      {/* Row 2: Status breakdown & Priority distribution */}
      <section
        className="dashboard-grid-row"
        aria-label="Status and Priority Distribution"
      >
        <CountBreakdownCard
          title="Status breakdown"
          items={statusItems}
          total={dashboard.total_tickets ?? 0}
        />
        <PriorityDonut
          data={priorityItems}
          centerLabel="tickets"
          emptyText={RECENT_EMPTY_TEXTS[effectiveRole]}
        />
      </section>

      {/* Row 3: Recent tickets (paginated) + admin category breakdown */}
      <section
        className="dashboard-grid-row"
        aria-label="Recent Tickets and Categories"
      >
        <ActivityList
          data={mapRecentToActivity(recentTickets)}
          title="Recent tickets"
          emptyText={RECENT_EMPTY_TEXTS[effectiveRole]}
        />
        {isAdmin && (
          <CountBreakdownCard
            title="Categories"
            items={categoryItems}
            emptyText="No categories recorded yet."
          />
        )}
      </section>

      {/* Recent tickets pagination (backend pagination applied to recent_tickets) */}
      {totalPages > 1 && (
        <div
          className={styles.paginationBar}
          aria-label="Recent tickets pagination"
        >
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages} · {recentTickets.length} shown of{' '}
            {totalItems} tickets
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

      {/* Row 4 (ADMIN): Agent workload across every status */}
      {isAdmin && dashboard.agent_workload && (
        <section aria-label="Agent Workload">
          <TeamTable
            data={dashboard.agent_workload}
            title="Agent workload"
            emptyText="No agents registered yet."
          />
        </section>
      )}
    </main>
  );
}
