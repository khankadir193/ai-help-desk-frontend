import { formatCsat } from '../../utils/formatters';
import './CustomerSatisfactionCard.css';

/**
 * CustomerSatisfactionCard
 *
 * Visual horizontal rating distribution bars (5★ to 1★).
 *
 * Props:
 *  data: { average, max_rating, total_responses, distribution: Array<{ stars, count }>, note }
 *  isLoading: boolean
 */
export default function CustomerSatisfactionCard({ data, isLoading }) {
  const average        = data?.average != null ? formatCsat(data.average) : '–';
  const maxRating      = data?.max_rating ?? 5;
  const totalResponses = data?.total_responses != null ? data.total_responses : '–';
  const numericTotal   = typeof totalResponses === 'number' ? totalResponses : 0;
  const note           = data?.note || (numericTotal > 0 ? `Y: rating · X: responses (0–${numericTotal})` : 'Customer rating distribution');

  const distribution = data?.distribution ?? [
    { stars: 5, count: 0 },
    { stars: 4, count: 0 },
    { stars: 3, count: 0 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 },
  ];

  if (isLoading) {
    return (
      <section className="reports-csat-card" aria-label="Loading Customer Satisfaction">
        <div className="reports-csat-card__title">Customer satisfaction</div>
        <div className="reports-csat-skeleton-score" />
        <div className="reports-csat-bars reports-csat-bars--skeleton" aria-hidden="true">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="reports-csat-skeleton-bar-row">
              <div className="reports-csat-skeleton-star" />
              <div className="reports-csat-skeleton-track" />
              <div className="reports-csat-skeleton-count" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="reports-csat-card" aria-label="Customer Satisfaction">
      <h2 className="reports-csat-card__title">Customer satisfaction</h2>

      {/* Main Score (20px/600) & Response Count (13px muted) */}
      <div className="reports-csat-score-row">
        <span className="reports-csat-score tabular-nums">
          {average} <span className="reports-csat-max">/ {maxRating}</span>
        </span>
        <span className="reports-csat-responses tabular-nums">
          {totalResponses !== '–' ? `${totalResponses} survey responses` : '–'}
        </span>
      </div>

      {/* Horizontal Rating Bars */}
      <div className="reports-csat-bars" role="group" aria-label="Rating distribution from 5 stars to 1 star">
        {distribution.map((item) => {
          const count = item.count ?? 0;
          const pct = numericTotal > 0 ? (count / numericTotal) * 100 : 0;
          return (
            <div key={item.stars} className="reports-csat-bar-row">
              <span className="reports-csat-star-label">
                {item.stars} <span className="reports-csat-star-icon" aria-hidden="true">★</span>
              </span>

              <div className="reports-csat-track">
                <div
                  className="reports-csat-fill"
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={count}
                  aria-valuemin={0}
                  aria-valuemax={numericTotal}
                  aria-label={`${item.stars} stars: ${count} responses`}
                />
              </div>

              <span className="reports-csat-count tabular-nums">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Footer note (13px muted) */}
      <p className="reports-csat-note">{note}</p>
    </section>
  );
}
