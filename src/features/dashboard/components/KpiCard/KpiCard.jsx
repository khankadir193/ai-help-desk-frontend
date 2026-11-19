import Icon from '../../../../components/Icon/Icon';
import './KpiCard.css';

/**
 * KPI card.
 *
 * Trend footers are only rendered when a real trend value is supplied.
 * Otherwise an optional `context` label explains what the number measures;
 * the card never invents a comparison.
 */
export default function KpiCard({
  label,
  value,
  trend,
  trendDirection = 'neutral',
  comparison = 'vs last 7 days',
  context,
  footnote,  // alias for context — either prop works
}) {
  const hasTrend = trend !== undefined && trend !== null && trend !== '';
  const footer = footnote ?? context;

  return (
    <div className="kpi-card">
      <div className="kpi-card__label">{label}</div>
      <div className="kpi-card__value tabular-nums">{value}</div>
      {hasTrend ? (
        <div className="kpi-card__footer">
          <span
            className={`kpi-card__trend kpi-card__trend--${trendDirection}`}
          >
            {trendDirection === 'up' && (
              <Icon name="arrow-up" size={13} strokeWidth={2.5} className="kpi-card__arrow" />
            )}
            {trendDirection === 'down' && (
              <Icon name="arrow-down" size={13} strokeWidth={2.5} className="kpi-card__arrow" />
            )}
            {trendDirection === 'neutral' && (
              <span className="kpi-card__dash" aria-hidden="true">—</span>
            )}
            <span className="kpi-card__trend-text">{trend}</span>
          </span>
          <span className="kpi-card__comparison">{comparison}</span>
        </div>
      ) : footer ? (
        <div className="kpi-card__footer">
          <span className="kpi-card__comparison">{footer}</span>
        </div>
      ) : null}
    </div>
  );
}
