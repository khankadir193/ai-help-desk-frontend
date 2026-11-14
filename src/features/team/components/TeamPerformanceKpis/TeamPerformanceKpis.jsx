import { formatDuration, formatPct } from '../../utils/teamFormatters';
import './TeamPerformanceKpis.css';

export default function TeamPerformanceKpis({ kpis, isLoading }) {
  if (isLoading) {
    return (
      <div className="team-kpi-grid" aria-label="Loading performance KPIs">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="team-kpi-card team-kpi-card--skeleton" aria-hidden="true">
            <div className="team-kpi-skeleton-label" />
            <div className="team-kpi-skeleton-value" />
            <div className="team-kpi-skeleton-caption" />
          </div>
        ))}
      </div>
    );
  }

  const resolvedTickets = kpis?.resolved_tickets != null ? String(kpis.resolved_tickets) : '–';
  const activeAgents = kpis?.active_agents_count != null ? `All ${kpis.active_agents_count} active agents` : 'All active agents';

  const firstResponse = formatDuration(kpis?.avg_first_response_hours, { includeSeconds: true });
  const resolutionTime = formatDuration(kpis?.avg_resolution_hours, { padMinutes: true });
  const slaPct = formatPct(kpis?.sla_compliance_pct, 0);

  const slaWithin = kpis?.sla_within_target != null ? kpis.sla_within_target : (kpis?.resolved_tickets != null ? kpis.resolved_tickets : null);
  const slaTotal = kpis?.sla_total_resolved != null ? kpis.sla_total_resolved : (kpis?.resolved_tickets != null ? kpis.resolved_tickets : null);
  const slaCaption = slaWithin != null && slaTotal != null ? `${slaWithin} of ${slaTotal} resolved` : 'Within SLA target';

  const cards = [
    {
      id: 'resolved',
      label: 'Resolved tickets',
      value: resolvedTickets,
      caption: activeAgents,
    },
    {
      id: 'first_response',
      label: 'Avg. first response',
      value: firstResponse,
      caption: 'First public reply',
    },
    {
      id: 'resolution',
      label: 'Avg. resolution',
      value: resolutionTime,
      caption: 'Created to resolved',
    },
    {
      id: 'sla',
      label: 'SLA compliance',
      value: slaPct,
      caption: slaCaption,
    },
  ];

  return (
    <div className="team-kpi-grid" aria-label="Key Performance Indicators">
      {cards.map((card) => (
        <div key={card.id} className="team-kpi-card">
          <span className="team-kpi-card__label">{card.label}</span>
          <span className="team-kpi-card__value tabular-nums">{card.value}</span>
          <span className="team-kpi-card__caption">{card.caption}</span>
        </div>
      ))}
    </div>
  );
}
