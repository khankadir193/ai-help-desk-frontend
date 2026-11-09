import { formatDuration, formatPct, formatCsat } from '../../utils/formatters';
import './ReportsKpiRow.css';

/**
 * ReportsKpiRow
 *
 * 6 equal cards displaying core help desk performance indicators.
 *
 * Props:
 *  kpis: { open_tickets, resolved_tickets, avg_first_response_hours, avg_resolution_hours, sla_compliance_pct, csat_avg, csat_responses }
 *  sla:  { within_target, total_resolved }
 *  isLoading: boolean
 */
export default function ReportsKpiRow({ kpis, sla, isLoading }) {
  if (isLoading) {
    return (
      <section className="reports-kpi-grid" aria-label="Loading key performance indicators">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="reports-kpi-card reports-kpi-card--skeleton" aria-hidden="true">
            <div className="reports-kpi-skeleton-label" />
            <div className="reports-kpi-skeleton-value" />
            <div className="reports-kpi-skeleton-caption" />
          </div>
        ))}
      </section>
    );
  }

  // Dynamic metrics with null-safe fallbacks
  const openTickets     = kpis?.open_tickets != null ? String(kpis.open_tickets) : '–';
  const resolvedTickets = kpis?.resolved_tickets != null ? String(kpis.resolved_tickets) : '–';
  const firstResponse   = formatDuration(kpis?.avg_first_response_hours);
  const resolutionTime  = formatDuration(kpis?.avg_resolution_hours);
  const slaPct          = formatPct(kpis?.sla_compliance_pct, 0);
  const csatScore       = formatCsat(kpis?.csat_avg);
  const csatResponses   = kpis?.csat_responses != null ? `${kpis.csat_responses} responses` : '–';

  const slaWithin = sla?.within_target != null ? sla.within_target : (kpis?.resolved_tickets != null ? kpis.resolved_tickets : '–');
  const slaTotal  = sla?.total_resolved != null ? sla.total_resolved : (kpis?.resolved_tickets != null ? kpis.resolved_tickets : '–');
  const slaCaption = slaWithin !== '–' && slaTotal !== '–' ? `${slaWithin} of ${slaTotal} tickets` : 'Tickets within SLA';

  const cards = [
    {
      id: 'open',
      label: 'Open tickets',
      value: openTickets,
      caption: 'Current backlog',
    },
    {
      id: 'resolved',
      label: 'Resolved',
      value: resolvedTickets,
      caption: 'Selected period',
    },
    {
      id: 'first_response',
      label: 'Avg. first response',
      value: firstResponse,
      caption: 'First public reply',
    },
    {
      id: 'avg_resolution',
      label: 'Avg. resolution',
      value: resolutionTime,
      caption: 'Created to resolved',
    },
    {
      id: 'sla_compliance',
      label: 'SLA compliance',
      value: slaPct,
      caption: slaCaption,
    },
    {
      id: 'csat',
      label: 'CSAT / 5',
      value: csatScore,
      caption: csatResponses,
    },
  ];

  return (
    <section className="reports-kpi-grid" aria-label="Key Performance Indicators">
      {cards.map((card) => (
        <article key={card.id} className="reports-kpi-card">
          <span className="reports-kpi-card__label">{card.label}</span>
          <span className="reports-kpi-card__value tabular-nums">{card.value}</span>
          <span className="reports-kpi-card__caption">{card.caption}</span>
        </article>
      ))}
    </section>
  );
}
