import Icon from '../Icon/Icon';
import './KpiCard.css';

export default function KpiCard({
  label,
  value,
  trend,
  trendDirection = 'neutral',
  comparison = 'vs last 7 days',
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-card__label">{label}</div>
      <div className="kpi-card__value tabular-nums">{value}</div>
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
    </div>
  );
}

