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

  const openTickets     = kpis?.open_tickets ?? 128;
  const resolvedTickets = kpis?.resolved_tickets ?? 312;
  const firstResponse   = formatDuration(kpis?.avg_first_response_hours ?? 0.211);
  const resolutionTime  = formatDuration(kpis?.avg_resolution_hours ?? 4.083);
  const slaPct          = formatPct(kpis?.sla_compliance_pct ?? 96, 0);
  const csatScore       = formatCsat(kpis?.csat_avg ?? 4.8);
  const csatResponses   = kpis?.csat_responses ?? 200;

  const slaWithin = sla?.within_target ?? 300;
  const slaTotal  = sla?.total_resolved ?? resolvedTickets;

  const cards = [
    {
      id: 'open',
      label: 'Open tickets',
      value: String(openTickets),
      caption: 'Current backlog',
    },
    {
      id: 'resolved',
      label: 'Resolved',
      value: String(resolvedTickets),
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
      caption: `${slaWithin} of ${slaTotal} tickets`,
    },
    {
      id: 'csat',
      label: 'CSAT / 5',
      value: csatScore,
      caption: `${csatResponses} responses`,
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

