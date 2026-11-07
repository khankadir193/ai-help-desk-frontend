import { formatShortDate } from '../../utils/formatters';
import { niceMax, buildYSteps, barGeometry } from '../../utils/chartHelpers';
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
  const totalCreated = data?.total_created ?? 353;
  const totalResolved = data?.total_resolved ?? 312;

  // Max value across all created & resolved counts
  const allCounts = days.flatMap((d) => [d.created, d.resolved]);
  const rawMax = Math.max(...allCounts, 0);
  const yMax = niceMax(rawMax > 0 ? rawMax : 80);
  const steps = buildYSteps(yMax, 4);

  // Layout geometry
  const CHART_H = 190;
  const LEFT_AXIS = 34;
  const BOTTOM_AXIS = 26;

  const { groupW, barW, barGap, groupGap } = barGeometry(days.length);
  const totalW = Math.max(
    LEFT_AXIS + days.length * (groupW + groupGap) - groupGap + 12,
    460
  );

  const toBarH = (val) => (yMax > 0 ? (val / yMax) * CHART_H : 0);

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
      <div className="reports-tv-chart-scroll" role="img" aria-label={`Ticket volume grouped bar chart: ${totalCreated} created, ${totalResolved} resolved over ${days.length} days.`}>
        <svg
          viewBox={`0 0 ${totalW} ${CHART_H + BOTTOM_AXIS + 6}`}
          className="reports-tv-svg"
          preserveAspectRatio="none"
        >
          {/* Horizontal grid lines & Y-axis labels */}
          {steps.map((step) => {
            const y = CHART_H - toBarH(step) + 4;
            return (
              <g key={step}>
                <line
                  x1={LEFT_AXIS}
                  x2={totalW}
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
            const groupX = LEFT_AXIS + i * (groupW + groupGap);
            const createdH = Math.max(toBarH(day.created), day.created > 0 ? 4 : 0);
            const resolvedH = Math.max(toBarH(day.resolved), day.resolved > 0 ? 4 : 0);

            const createdY = CHART_H - createdH + 4;
            const resolvedY = CHART_H - resolvedH + 4;

            const shortLabel = formatShortDate(day.date);

            return (
              <g key={day.date} className="reports-tv-bar-group">
                <title>{`${shortLabel}: ${day.created} created, ${day.resolved} resolved`}</title>

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

                {/* Resolved bar (green/teal) */}
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
                  y={CHART_H + BOTTOM_AXIS}
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

