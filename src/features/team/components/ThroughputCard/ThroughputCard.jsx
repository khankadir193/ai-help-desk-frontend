import { formatShortDate } from '../../utils/teamFormatters';
import { niceMax, buildYSteps } from '../../utils/chartUtils';
import './ThroughputCard.css';

export default function ThroughputCard({ throughput = [], isLoading }) {
  const days = throughput || [];

  const allCounts = days.flatMap((d) => [d.created ?? 0, d.resolved ?? 0]);
  const rawMax = Math.max(...allCounts, 0);
  const yMax = niceMax(rawMax > 0 ? rawMax : 80);
  const steps = buildYSteps(yMax, 4);

  // SVG dimensions
  const VIEW_W = 620;
  const VIEW_H = 175;
  const LEFT_AXIS = 36;
  const RIGHT_PAD = 14;
  const TOP_PAD = 16;
  const BOTTOM_AXIS = 26;
  const PLOT_H = VIEW_H - TOP_PAD - BOTTOM_AXIS; // 133px
  const AVAILABLE_W = VIEW_W - LEFT_AXIS - RIGHT_PAD;

  const slotW = days.length > 0 ? AVAILABLE_W / days.length : AVAILABLE_W;
  const barW = Math.min(18, Math.max(8, (slotW - 14) / 2));
  const barGap = 4;

  const toBarH = (val) => (yMax > 0 ? (val / yMax) * PLOT_H : 0);

  if (isLoading) {
    return (
      <section className="throughput-card" aria-label="Loading ticket throughput chart">
        <div className="throughput-card__header">
          <div className="throughput-card__skeleton-title" />
          <div className="throughput-card__skeleton-legend" />
        </div>
        <div className="throughput-card__chart throughput-card__chart--skeleton" aria-hidden="true">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="throughput-skeleton-group">
              <div className="throughput-skeleton-bar throughput-skeleton-bar--created" />
              <div className="throughput-skeleton-bar throughput-skeleton-bar--resolved" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const totalCreated = days.reduce((sum, d) => sum + (d.created ?? 0), 0);
  const totalResolved = days.reduce((sum, d) => sum + (d.resolved ?? 0), 0);

  return (
    <section className="throughput-card" aria-label="Ticket throughput">
      <div className="throughput-card__header">
        <h2 className="throughput-card__title">Ticket throughput</h2>

        <div className="throughput-legend">
          <span className="throughput-legend__item">
            <span className="throughput-legend__dot throughput-legend__dot--created" aria-hidden="true" />
            Created
          </span>
          <span className="throughput-legend__item">
            <span className="throughput-legend__dot throughput-legend__dot--resolved" aria-hidden="true" />
            Resolved
          </span>
          <span className="throughput-legend__note">Y: tickets · X: date</span>
        </div>
      </div>

      <div
        className="throughput-chart-container"
        role="img"
        aria-label={`Ticket throughput grouped bar chart: ${totalCreated} created, ${totalResolved} resolved over ${days.length} days.`}
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="throughput-svg"
          preserveAspectRatio="none"
        >
          {/* Horizontal gridlines and Y-axis labels */}
          {steps.map((step) => {
            const y = TOP_PAD + (PLOT_H - toBarH(step));
            return (
              <g key={step}>
                <line
                  x1={LEFT_AXIS}
                  x2={VIEW_W - RIGHT_PAD}
                  y1={y}
                  y2={y}
                  className="throughput-gridline"
                />
                <text
                  x={LEFT_AXIS - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="throughput-axis-label"
                >
                  {step}
                </text>
              </g>
            );
          })}

          {/* Grouped bars */}
          {days.map((day, i) => {
            const groupX = LEFT_AXIS + i * slotW + (slotW - (barW * 2 + barGap)) / 2;
            const createdH = Math.max(toBarH(day.created ?? 0), (day.created ?? 0) > 0 ? 3 : 0);
            const resolvedH = Math.max(toBarH(day.resolved ?? 0), (day.resolved ?? 0) > 0 ? 3 : 0);

            const createdY = TOP_PAD + (PLOT_H - createdH);
            const resolvedY = TOP_PAD + (PLOT_H - resolvedH);

            const shortLabel = formatShortDate(day.date);

            return (
              <g key={day.date} className="throughput-bar-group">
                <title>{`${shortLabel}: ${day.created ?? 0} created, ${day.resolved ?? 0} resolved`}</title>

                {/* Created bar (Indigo) */}
                <rect
                  x={groupX}
                  y={createdY}
                  width={barW}
                  height={createdH}
                  rx="3"
                  ry="3"
                  className="throughput-bar throughput-bar--created"
                />

                {/* Resolved bar (Green) */}
                <rect
                  x={groupX + barW + barGap}
                  y={resolvedY}
                  width={barW}
                  height={resolvedH}
                  rx="3"
                  ry="3"
                  className="throughput-bar throughput-bar--resolved"
                />

                {/* X-axis date label */}
                <text
                  x={groupX + barW + barGap / 2}
                  y={VIEW_H - 6}
                  textAnchor="middle"
                  className="throughput-axis-label throughput-x-label"
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
