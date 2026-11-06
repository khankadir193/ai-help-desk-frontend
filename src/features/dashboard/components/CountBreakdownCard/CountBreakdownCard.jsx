import Icon from '../../../../components/Icon/Icon';
import './CountBreakdownCard.css';

/**
 * Generic count breakdown card (status breakdown, admin category counts).
 * Renders the values the dashboard API actually returns:
 *   - status_counts  -> {label, count} rows (zero-filled by the backend)
 *   - category_counts -> {label, count} rows ("Uncategorized" for null)
 * @param {Object} props
 * @param {string} props.title
 * @param {Array<{ id: string|number, label: string, count: number, color?: string }>} props.items
 * @param {number} [props.total] - denominator for the bar widths; defaults to the sum of counts
 * @param {string} [props.emptyText]
 */
export default function CountBreakdownCard({ title, items = [], total, emptyText }) {
  const hasNegative = items.some((item) => item.count < 0);
  const computedTotal = Math.abs(total ?? items.reduce((sum, item) => sum + item.count, 0));
  const denom = hasNegative ? Math.max(...items.map((item) => Math.abs(item.count)), 1) : computedTotal;

  return (
    <div className="count-breakdown-card">
      <div className="count-breakdown-card__header">
        <h3 className="count-breakdown-card__title">{title}</h3>
      </div>

      {(!items || items.length === 0) ? (
        <p className="count-breakdown-card__empty">
          {emptyText || 'Nothing to show here yet.'}
        </p>
      ) : (
        <ul className="count-breakdown-card__list">
          {items.map((item) => {
            const share = denom > 0 ? item.count / denom : 0;
            return (
              <li key={item.id} className="count-breakdown-card__row">
                <div className="count-breakdown-card__row-top">
                  <span className="count-breakdown-card__label">{item.label}</span>
                  <span className="count-breakdown-card__count tabular-nums">
                    {item.count}
                  </span>
                </div>
                <div className="count-breakdown-card__bar-track">
                  <div
                    className="count-breakdown-card__bar-fill"
                    style={{
                      width: `${Math.min(100, share * 100)}%`,
                      backgroundColor: item.color || 'var(--color-primary)',
                    }}
                    aria-hidden="true"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {items.length > 0 && total === 0 && (
        <p className="count-breakdown-card__note">
          <Icon name="minus" size={12} />
          All counts are zero.
        </p>
      )}
    </div>
  );
}
