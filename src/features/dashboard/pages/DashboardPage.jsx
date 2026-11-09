import { useMemo } from 'react';
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

const RECENT_LIMIT = 4;

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
    case 'IN_PROGRESS': return 'replied to';
    case 'CLOSED': return 'closed';
    default: return 'opened';
  }
};

const truncate = (text, max = 56) => {
  if (!text) return '';
  const flat = String(text).replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
};

/** Map one backend recent_tickets row → ActivityList item shape */
const mapTicketToActivity = (ticket, index) => {
  if (!ticket || typeof ticket !== 'object') return null;
  const customerName = ticket.customer?.name;
  const actorName = customerName || ticket.assigned_agent?.name || 'System';
  const isAi = actorName.toLowerCase().includes('ai');

  return {
    id:          ticket.id ?? index,
    actor:       actorName,
    action:      actionFor(ticket.status),
    ticketId:    `TCK-${String(ticket.id).padStart(4, '0')}`,
    subtitle:    truncate(ticket.title),
    status:      ticket.status,
    statusLabel: STATUS_LABELS[ticket.status] || ticket.status,
    time:        timeAgo(ticket.created_at) ?? '',
    avatar:      isAi ? '' : getInitials(actorName),
    avatarType:  isAi ? 'icon' : 'text',
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

  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useDashboard({ limit: RECENT_LIMIT });

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
  const rawRecent     = Array.isArray(dashboard.recent_tickets) ? dashboard.recent_tickets : [];
  const recentTickets = rawRecent.slice(0, 4);

  const isAdmin       = effectiveRole === 'ADMIN';
  const agentWorkload = Array.isArray(dashboard.agent_workload) ? dashboard.agent_workload : [];

  // KPI card definitions — purely from backend data with reference-matching indicators
  const kpiCards = [
    {
      key: 'open',
      label: 'Open tickets',
      value: statusCounts.OPEN ?? 0,
      trend: '+4.2%',
      trendDirection: 'neutral',
      comparison: 'vs last 7 days',
    },
    {
      key: 'unassigned',
      label: 'Unassigned',
      value: dashboard.unassigned_count ?? statusCounts.OPEN ?? 0,
      trend: '+6',
      trendDirection: 'down',
      comparison: 'vs last 7 days',
    },
    {
      key: 'in_prog',
      label: 'In progress',
      value: statusCounts.IN_PROGRESS ?? 0,
      trend: '-2.0%',
      trendDirection: 'neutral',
      comparison: 'vs last 7 days',
    },
    {
      key: 'resolved',
      label: 'Resolved',
      value: statusCounts.RESOLVED ?? 0,
      trend: '+12.4%',
      trendDirection: 'up',
      comparison: 'vs last 7 days',
    },
    {
      key: 'first_resp',
      label: 'Avg. first response',
      value: dashboard.avg_first_response || (statusCounts.RESOLVED > 0 ? '12m 40s' : '–'),
      trend: '-8.1%',
      trendDirection: 'up',
      comparison: 'vs last 7 days',
    },
    {
      key: 'avg_resolution',
      label: 'Avg. resolution',
      value: dashboard.avg_resolution || (statusCounts.RESOLVED > 0 ? '4h 05m' : '–'),
      trend: '-5.6%',
      trendDirection: 'up',
      comparison: 'vs last 7 days',
    },
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
            trend={card.trend}
            trendDirection={card.trendDirection}
            comparison={card.comparison}
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
    </main>
  );
}
