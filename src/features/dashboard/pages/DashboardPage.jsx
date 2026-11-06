import { useMemo, useState } from 'react';
import KpiCard from '../components/KpiCard/KpiCard';
import PriorityDonut from '../components/PriorityDonut/PriorityDonut';
import ActivityList from '../components/ActivityList/ActivityList';
import TeamTable from '../components/TeamTable/TeamTable';
import CountBreakdownCard from '../components/CountBreakdownCard/CountBreakdownCard';
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

/**
 * Presentation defaults derived from the values the dashboard service
 * actually returns (status_counts / priority_counts enums).
 */
const STATUS_ITEMS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((key) => ({
  key,
  label: STATUS_LABELS[key],
}));

const PRIORITY_ITEMS = [
  { key: 'URGENT', label: 'Urgent', color: 'var(--color-danger)' },
  { key: 'HIGH', label: 'High', color: 'var(--color-amber)' },
  { key: 'MEDIUM', label: 'Medium', color: 'var(--color-blue)' },
  { key: 'LOW', label: 'Low', color: 'var(--color-slate)' },
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

const truncate = (text, max = 60) => {
  if (!text) return '';
  const flat = String(text).replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
};

/**
 * Map ONE backend recent_tickets row onto the ActivityList item shape.
 * (Designed as a per-ticket callback for `.map()` — the previous
 * whole-array signature crashed with "tickets.map is not a function"
 * when passed directly to `recentTickets.map()`.)
 */
const mapTicketToActivity = (ticket, index) => {
  // A malformed row must degrade to a skip, never crash the dashboard
  if (!ticket || typeof ticket !== 'object') return null;
  const customerName = ticket.customer?.name;
  return {
    id: ticket.id ?? index,
    actor: customerName || 'Unknown',
    action: 'opened',
    ticketId: `#${ticket.id}`,
    subtitle: truncate(ticket.title),
    status: ticket.status,
    statusLabel: STATUS_LABELS[ticket.status] || ticket.status,
    time: timeAgo(ticket.created_at) ?? '',
    avatar: getInitials(customerName),
    avatarType: 'text',
  };
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

  const pagination = dashboard?.pagination ?? {};
  const totalPages = Number(pagination.total_pages) || 0;

  // Auto-clamp when the scoped dataset shrank while the user sat on a later
  // page (deleted tickets, scope change) — the backend would otherwise keep
  // returning an empty page past the end. Deriving the value avoids
  // cascading renders from a state-sync effect; the pagination buttons also
  // step to the clamped value, keeping requestedPage in range after shrink.
  const page = totalPages > 0 ? Math.min(requestedPage, totalPages) : requestedPage;

  const greetingTitle = getGreeting(user?.name);

  // Real breakdowns — zero-filled by the backend, so every enum value exists
  const priorityItems = useMemo(
    () =>
      PRIORITY_ITEMS.map((item) => {
        const count = dashboard?.priority_counts?.[item.key] ?? 0;
        const total = dashboard?.total_tickets ?? 0;
        const share = total > 0 ? `${Math.round((count / total) * 100)}%` : '0%';
        return {
          id: item.key.toLowerCase(),
          label: item.label,
          count,
          color: item.color,
          percentage: share,
        };
      }),
    [dashboard]
  );

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

  // Real breakdowns — the mapping above is memoized before the early returns
  const statusItems = STATUS_ITEMS.map((item) => ({
    id: item.key,
    label: item.label,
    count: dashboard.status_counts?.[item.key] ?? 0,
  }));

  const recentTickets = Array.isArray(dashboard.recent_tickets)
    ? dashboard.recent_tickets
    : [];
  const totalItems = Number(pagination.total_items) || 0;
  const currentPage = Number(pagination.page) || page;

  const isAdmin = effectiveRole === 'ADMIN';
  const categoryCounts = Array.isArray(dashboard.category_counts)
    ? dashboard.category_counts
    : [];
  const categoryItems = categoryCounts.map((row) => {
    if (!row || typeof row !== 'object') return null;
    return {
      id: row.category_id ?? 'uncategorized',
      label: row.category_name || 'Uncategorized',
      count: row.count ?? 0,
    };
  });
  const agentWorkload = Array.isArray(dashboard.agent_workload)
    ? dashboard.agent_workload
    : [];

  return (
    <main className="dashboard-content">
      {/* Greeting Row */}
      <section className="greeting-row" aria-label="Overview Header">
        <div className="greeting-row__left">
          <h2 className="greeting-row__title">{greetingTitle}</h2>
          <p className="greeting-row__subtext">
            {ROLE_SUBTEXTS[effectiveRole] || ROLE_SUBTEXTS.CUSTOMER}
          </p>
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
          data={recentTickets.map(mapTicketToActivity).filter(Boolean)}
          title="Recent tickets"
          emptyText={RECENT_EMPTY_TEXTS[effectiveRole]}
        />
        {isAdmin && (
          <CountBreakdownCard
            title="Categories"
            items={categoryItems.filter(Boolean)}
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

      {/* Row 4 (ADMIN): Agent workload across every status */}
      {isAdmin && (
        <section aria-label="Agent Workload">
          <TeamTable
            data={agentWorkload}
            title="Agent workload"
            emptyText="No agents registered yet."
          />
        </section>
      )}
    </main>
  );
}
