import './TicketVolumeChart.css';

/**
 * TicketVolumeChart
 *
 * Renders a grouped responsive SVG bar chart for ticket volume.
 * Each day has { label, created, resolved }.
 * Status counts are used as fallback if no per-day breakdown is provided.
 */
export default function TicketVolumeChart({ data = [], statusCounts = {}, isLoading }) {
  const rows = data.length > 0
    ? data
    : buildFallbackRows(statusCounts);

  const allValues = rows.flatMap((r) => [r.created, r.resolved]);
  const dataMax = Math.max(...allValues, 0);

  // Nice y-axis ceiling (rounded up to nearest 25 / 50 / 100)
  const yMax = niceMax(dataMax);
  const steps = buildSteps(yMax);

  // Chart responsive coordinates
  const VIEW_W = 640;
  const VIEW_H = 190;
  const LEFT_AXIS = 36;
  const RIGHT_PAD = 16;
  const TOP_PAD = 14;
  const BOTTOM = 26;
  const PLOT_H = VIEW_H - TOP_PAD - BOTTOM;
  const AVAILABLE_W = VIEW_W - LEFT_AXIS - RIGHT_PAD;

  const slotW = rows.length > 0 ? AVAILABLE_W / rows.length : AVAILABLE_W;
  const BAR_W = 16;
  const GAP_BTW = 5;

  const toBarH = (val) => (yMax > 0 ? (val / yMax) * PLOT_H : 0);

  if (isLoading) {
    return (
      <div className="tv-card">
        <div className="tv-card__header">
          <h3 className="tv-card__title">Ticket volume</h3>
        </div>
        <div className="tv-chart tv-chart--skeleton" aria-hidden="true">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="tv-skeleton-group">
              <div className="tv-skeleton-bar tv-skeleton-bar--a" />
              <div className="tv-skeleton-bar tv-skeleton-bar--b" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!rows.length || yMax === 0) {
    return (
      <div className="tv-card">
        <div className="tv-card__header">
          <h3 className="tv-card__title">Ticket volume</h3>
        </div>
        <p className="tv-empty">No ticket volume data available yet.</p>
      </div>
    );
  }

  return (
    <div className="tv-card">
      {/* Header */}
      <div className="tv-card__header">
        <h3 className="tv-card__title">Ticket volume</h3>
        <div className="tv-legend">
          <span className="tv-legend__item">
            <span className="tv-legend__dot tv-legend__dot--created" />
            Created
          </span>
          <span className="tv-legend__item">
            <span className="tv-legend__dot tv-legend__dot--resolved" />
            Resolved
          </span>
        </div>
      </div>

      {/* SVG chart container */}
      <div className="tv-chart-scroll" role="img" aria-label="Ticket volume bar chart">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="tv-svg"
          preserveAspectRatio="none"
        >
          {/* Horizontal grid lines + y-axis labels */}
          {steps.map((step) => {
            const y = TOP_PAD + (PLOT_H - toBarH(step));
            return (
              <g key={step}>
                <line
                  x1={LEFT_AXIS}
                  x2={VIEW_W - RIGHT_PAD}
                  y1={y}
                  y2={y}
                  className="tv-gridline"
                />
                <text
                  x={LEFT_AXIS - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="tv-axis-label"
                >
                  {step}
                </text>
              </g>
            );
          })}

          {/* Grouped Bars */}
          {rows.map((row, i) => {
            const groupX = LEFT_AXIS + i * slotW + (slotW - (BAR_W * 2 + GAP_BTW)) / 2;
            const createdH = Math.max(toBarH(row.created), row.created > 0 ? 4 : 0);
            const resolvedH = Math.max(toBarH(row.resolved), row.resolved > 0 ? 4 : 0);

            return (
              <g key={row.label}>
                {/* Created bar (indigo) */}
                <rect
                  x={groupX}
                  y={TOP_PAD + (PLOT_H - createdH)}
                  width={BAR_W}
                  height={createdH}
                  className="tv-bar tv-bar--created"
                  rx="4"
                  ry="4"
                />
                {/* Resolved bar (emerald) */}
                <rect
                  x={groupX + BAR_W + GAP_BTW}
                  y={TOP_PAD + (PLOT_H - resolvedH)}
                  width={BAR_W}
                  height={resolvedH}
                  className="tv-bar tv-bar--resolved"
                  rx="4"
                  ry="4"
                />
                {/* X-axis label centered under the group */}
                <text
                  x={groupX + (BAR_W * 2 + GAP_BTW) / 2}
                  y={VIEW_H - 6}
                  textAnchor="middle"
                  className="tv-axis-label"
                >
                  {row.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildFallbackRows(statusCounts) {
  const created = (statusCounts.OPEN ?? 0) + (statusCounts.IN_PROGRESS ?? 0);
  const resolved = (statusCounts.RESOLVED ?? 0) + (statusCounts.CLOSED ?? 0);

  if (created === 0 && resolved === 0) return [];

  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weights = [0.18, 0.17, 0.16, 0.17, 0.15, 0.09, 0.08];

  return DAY_LABELS.map((label, i) => ({
    label,
    created: Math.round(created * weights[i]),
    resolved: Math.round(resolved * weights[i]),
  }));
}

function niceMax(raw) {
  if (raw === 0) return 0;
  if (raw <= 10) return 10;
  if (raw <= 25) return 25;
  if (raw <= 50) return 50;
  if (raw <= 75) return 75;
  if (raw <= 100) return 100;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  return Math.ceil(raw / mag) * mag;
}

function buildSteps(yMax) {
  if (yMax === 0) return [0];
  const STEP_COUNT = 4;
  const step = yMax / STEP_COUNT;
  return Array.from({ length: STEP_COUNT + 1 }, (_, i) => Math.round(i * step));
}
