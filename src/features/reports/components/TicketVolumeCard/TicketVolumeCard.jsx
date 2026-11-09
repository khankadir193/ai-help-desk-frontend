import { formatShortDate } from '../../utils/formatters';
import { niceMax, buildYSteps } from '../../utils/chartHelpers';
import './TicketVolumeCard.css';

/**
 * TicketVolumeCard
 *
 * Visual grouped bar chart for daily created vs resolved volume.
 *
 * Props:
 *  data: { days: Array<{ date, created, resolved }>, total_created, total_resolved }
 *  isLoading: boolean
 */
export default function TicketVolumeCard({ data, isLoading }) {
  const days = data?.days ?? [];
  const totalCreated = data?.total_created != null ? data.total_created : '–';
  const totalResolved = data?.total_resolved != null ? data.total_resolved : '–';

  // Max value across all created & resolved counts
  const allCounts = days.flatMap((d) => [d.created ?? 0, d.resolved ?? 0]);
  const rawMax = Math.max(...allCounts, 0);
  const yMax = niceMax(rawMax > 0 ? rawMax : 80);
  const steps = buildYSteps(yMax, 4);

  // Responsive SVG Geometry inside 150px chart area
  const VIEW_W = 640;
  const VIEW_H = 150;
  const LEFT_AXIS = 34;
  const RIGHT_PAD = 14;
  const TOP_PAD = 14;
  const BOTTOM_AXIS = 22;
  const PLOT_H = VIEW_H - TOP_PAD - BOTTOM_AXIS; // 114px
  const AVAILABLE_W = VIEW_W - LEFT_AXIS - RIGHT_PAD;

  const slotW = days.length > 0 ? AVAILABLE_W / days.length : AVAILABLE_W;
  const barW = Math.min(18, Math.max(8, (slotW - 14) / 2));
  const barGap = 5;

  const toBarH = (val) => (yMax > 0 ? (val / yMax) * PLOT_H : 0);

  if (isLoading) {
    return (
      <section className="reports-tv-card" aria-label="Loading ticket volume chart">
        <div className="reports-tv-card__header">
          <div className="reports-tv-skeleton-title" />
        </div>
        <div className="reports-tv-chart reports-tv-chart--skeleton" aria-hidden="true">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="reports-tv-skeleton-group">
              <div className="reports-tv-skeleton-bar reports-tv-skeleton-bar--a" />
              <div className="reports-tv-skeleton-bar reports-tv-skeleton-bar--b" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="reports-tv-card" aria-label="Ticket Volume">
      {/* Header with dynamic totals and legend */}
      <div className="reports-tv-card__header">
        <h2 className="reports-tv-card__title">
          Ticket volume <span className="reports-tv-card__counts">· {totalCreated} created / {totalResolved} resolved</span>
        </h2>

        <div className="reports-tv-legend">
          <span className="reports-tv-legend__item">
            <span className="reports-tv-legend__box reports-tv-legend__box--created" aria-hidden="true" />
            Created
          </span>
          <span className="reports-tv-legend__item">
            <span className="reports-tv-legend__box reports-tv-legend__box--resolved" aria-hidden="true" />
            Resolved
          </span>
          <span className="reports-tv-legend__axis-note">Y: tickets · X: date</span>
        </div>
      </div>

      {/* SVG Chart */}
      <div
        className="reports-tv-chart-container"
        role="img"
        aria-label={`Ticket volume grouped bar chart: ${totalCreated} created, ${totalResolved} resolved over ${days.length} days.`}
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="reports-tv-svg"
          preserveAspectRatio="none"
        >
          {/* Horizontal grid lines & Y-axis labels */}
          {steps.map((step) => {
            const y = TOP_PAD + (PLOT_H - toBarH(step));
            return (
              <g key={step}>
                <line
                  x1={LEFT_AXIS}
                  x2={VIEW_W - RIGHT_PAD}
                  y1={y}
                  y2={y}
                  className="reports-tv-gridline"
                />
                <text
                  x={LEFT_AXIS - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="reports-tv-axis-label"
                >
                  {step}
                </text>
              </g>
            );
          })}

          {/* Grouped Bars */}
          {days.map((day, i) => {
            const groupX = LEFT_AXIS + i * slotW + (slotW - (barW * 2 + barGap)) / 2;
            const createdH = Math.max(toBarH(day.created ?? 0), (day.created ?? 0) > 0 ? 3 : 0);
            const resolvedH = Math.max(toBarH(day.resolved ?? 0), (day.resolved ?? 0) > 0 ? 3 : 0);

            const createdY = TOP_PAD + (PLOT_H - createdH);
            const resolvedY = TOP_PAD + (PLOT_H - resolvedH);

            const shortLabel = formatShortDate(day.date);

            return (
              <g key={day.date} className="reports-tv-bar-group">
                <title>{`${shortLabel}: ${day.created ?? 0} created, ${day.resolved ?? 0} resolved`}</title>

                {/* Created bar (indigo) */}
                <rect
                  x={groupX}
                  y={createdY}
                  width={barW}
                  height={createdH}
                  rx="3"
                  ry="3"
                  className="reports-tv-bar reports-tv-bar--created"
                />

                {/* Resolved bar (green/emerald) */}
                <rect
                  x={groupX + barW + barGap}
                  y={resolvedY}
                  width={barW}
                  height={resolvedH}
                  rx="3"
                  ry="3"
                  className="reports-tv-bar reports-tv-bar--resolved"
                />

                {/* X-axis date label */}
                <text
                  x={groupX + barW + barGap / 2}
                  y={VIEW_H - 4}
                  textAnchor="middle"
                  className="reports-tv-axis-label reports-tv-x-label"
                >
                  {shortLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
