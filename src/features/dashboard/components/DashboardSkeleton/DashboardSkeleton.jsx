import DateRangePicker from '../DateRangePicker/DateRangePicker';
import './DashboardSkeleton.css';

export default function DashboardSkeleton({
  greetingTitle = 'Good morning, Maya',
  subtext = "Here's what's happening across support today.",
  startDate = null,
  endDate = null,
  onDateChange,
  effectiveRole = 'ADMIN',
}) {
  const isAdmin = effectiveRole === 'ADMIN';

  return (
    <main className="dashboard-content" aria-busy="true" aria-label="Loading dashboard...">
      {/* ── Greeting Row ───────────────────────────────────────────────── */}
      <section className="greeting-row" aria-label="Overview Header">
        <div className="greeting-row__left">
          <h2 className="greeting-row__title">{greetingTitle}</h2>
          <p className="greeting-row__subtext">{subtext}</p>
        </div>

        <div className="greeting-row__actions">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={onDateChange}
          />

          <button
            type="button"
            className="btn-export"
            aria-label="Export dashboard data as CSV"
            disabled
          >
            Export
          </button>
        </div>
      </section>

      {/* ── Row 1: KPI Cards Skeleton ──────────────────────────────────── */}
      <section className="kpi-grid" aria-label="Loading Key Performance Indicators">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="dashboard-skeleton__kpi-card" aria-hidden="true">
            <div className="dashboard-skeleton__pulse dashboard-skeleton__kpi-label" />
            <div className="dashboard-skeleton__pulse dashboard-skeleton__kpi-val" />
            <div className="dashboard-skeleton__pulse dashboard-skeleton__kpi-sub" />
          </div>
        ))}
      </section>

      {/* ── Row 2: Ticket Volume + Priority Donut Skeleton ─────────────── */}
      <section className="dashboard-grid-row" aria-label="Loading Volume and Priority">
        <div className="tv-card" aria-hidden="true">
          <div className="tv-card__header">
            <h3 className="tv-card__title">Ticket volume</h3>
            <div className="tv-header__legend">
              <span className="tv-legend-item">
                <span className="tv-legend-dot tv-legend-dot--created" />
                <span className="tv-legend-label">Created</span>
              </span>
              <span className="tv-legend-item">
                <span className="tv-legend-dot tv-legend-dot--resolved" />
                <span className="tv-legend-label">Resolved</span>
              </span>
            </div>
          </div>
          <div className="dashboard-skeleton__pulse dashboard-skeleton__chart-rect" />
        </div>

        <div className="priority-donut-card" aria-hidden="true">
          <div className="priority-donut-card__header">
            <h3 className="priority-donut-card__title">Priority distribution</h3>
          </div>
          <div className="dashboard-skeleton__donut-wrapper">
            <div className="dashboard-skeleton__pulse dashboard-skeleton__donut-circle" />
          </div>
        </div>
      </section>

      {/* ── Row 3: Recent Tickets + Team Performance Skeleton ──────────── */}
      <section
        className={`dashboard-grid-row ${isAdmin ? '' : 'dashboard-grid-row--single'}`}
        aria-label="Loading Recent tickets and team"
      >
        <div className="activity-card" aria-hidden="true">
          <div className="activity-card__header">
            <h3 className="activity-card__title">Recent ticket activity</h3>
            <span className="activity-card__view-all-btn" style={{ opacity: 0.6 }}>
              View all
            </span>
          </div>
          <div className="dashboard-skeleton__activity-list">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="dashboard-skeleton__pulse dashboard-skeleton__activity-row"
              />
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="team-card" aria-hidden="true">
            <div className="team-card__header">
              <h3 className="team-card__title">Team performance</h3>
              <span className="team-card__full-report-btn" style={{ opacity: 0.6 }}>
                Full report
              </span>
            </div>
            <div className="team-card__table-wrapper">
              <div className="dashboard-skeleton__team-table-head">
                <span>Agent</span>
                <span style={{ textAlign: 'right' }}>Solved</span>
                <span style={{ textAlign: 'right' }}>Resp.</span>
                <span style={{ textAlign: 'right' }}>CSAT</span>
              </div>
              <div className="dashboard-skeleton__team-list">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="dashboard-skeleton__pulse dashboard-skeleton__team-row"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
