import { ringDash } from '../../utils/chartHelpers';
import './ResolutionSlaCard.css';

/**
 * ResolutionSlaCard
 *
 * Visual circular progress ring + breakdown stats for SLA compliance.
 *
 * Props:
 *  data: { percentage, within_target, breached_target, total_resolved, note }
 *  isLoading: boolean
 */
export default function ResolutionSlaCard({ data, isLoading }) {
  const percentage     = data?.percentage ?? 96;
  const withinTarget   = data?.within_target ?? 300;
  const breachedTarget = data?.breached_target ?? 12;
  const totalResolved  = data?.total_resolved ?? 312;
  const note           = data?.note || 'Share resolved within the configured SLA. Open tickets are excluded.';

  // Circular ring geometry
  const size = 112;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const { dashArray } = ringDash(percentage, radius);

  if (isLoading) {
    return (
      <section className="reports-sla-card" aria-label="Loading Resolution SLA">
        <div className="reports-sla-card__title">Resolution SLA</div>
        <div className="reports-sla-card__body reports-sla-card__body--skeleton" aria-hidden="true">
          <div className="reports-sla-skeleton-ring" />
          <div className="reports-sla-skeleton-stats">
            <div className="reports-sla-skeleton-line" />
            <div className="reports-sla-skeleton-line" />
            <div className="reports-sla-skeleton-line" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="reports-sla-card" aria-label="Resolution SLA">
      <h2 className="reports-sla-card__title">Resolution SLA</h2>

      <div className="reports-sla-card__body">
        {/* Left: Progress Ring */}
        <div className="reports-sla-ring-container" role="img" aria-label={`Resolution SLA compliance: ${percentage}% within target.`}>
          <svg
            width={size}
            height={size}
            className="reports-sla-ring-svg"
          >
            {/* Background Track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              className="reports-sla-ring-track"
              strokeWidth={strokeWidth}
            />
            {/* Foreground Arc */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              className="reports-sla-ring-progress"
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={0}
              transform={`rotate(-90 ${center} ${center})`}
            />
          </svg>

          {/* Centered Percentage Text */}
          <div className="reports-sla-ring-text">
            <span className="reports-sla-ring-percent tabular-nums">{percentage}%</span>
            <span className="reports-sla-ring-label">within</span>
          </div>
        </div>

        {/* Right: Key Breakdown Lines */}
        <div className="reports-sla-breakdown">
          <div className="reports-sla-stat reports-sla-stat--within">
            <span className="tabular-nums font-semibold">{withinTarget}</span> within target
          </div>
          <div className="reports-sla-stat reports-sla-stat--breached">
            <span className="tabular-nums font-semibold">{breachedTarget}</span> breached target
          </div>
          <div className="reports-sla-stat reports-sla-stat--total">
            <span className="tabular-nums">{totalResolved}</span> resolved tickets
          </div>
        </div>
      </div>

      {/* Explanatory footer note */}
      <p className="reports-sla-note">{note}</p>
    </section>
  );
}

