import Avatar from '../../../../components/Avatar/Avatar';
import getInitials from '../../../dashboard/utils/initials';
import { formatDuration, formatPct, formatCsat } from '../../utils/formatters';
import './AgentPerformanceTable.css';

/**
 * AgentPerformanceTable
 *
 * Table displaying per-agent resolution volume, first response time, SLA rate, and CSAT.
 *
 * Props:
 *  data: { agents: Array<{ agent_id, agent_name, resolved, avg_first_response_hours, sla_met_pct, csat_avg }>, meta_text }
 *  isLoading: boolean
 */
export default function AgentPerformanceTable({ data, isLoading }) {
  const agents = data?.agents ?? [];
  const metaText = data?.meta_text || '4 of 8 agents · Illustrative data';

  if (isLoading) {
    return (
      <section className="reports-agent-card" aria-label="Loading Agent Performance">
        <div className="reports-agent-card__header">
          <div className="reports-agent-skeleton-title" />
          <div className="reports-agent-skeleton-meta" />
        </div>
        <div className="reports-agent-table-container">
          <table className="reports-agent-table" aria-hidden="true">
            <tbody>
              {[...Array(4)].map((_, i) => (
                <tr key={i} className="reports-agent-skeleton-row">
                  <td colSpan={5}>
                    <div className="reports-agent-skeleton-cell" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <section className="reports-agent-card" aria-label="Agent Performance">
      <div className="reports-agent-card__header">
        <h2 className="reports-agent-card__title">Agent performance</h2>
        <span className="reports-agent-card__meta">{metaText}</span>
      </div>

      <div className="reports-agent-table-container">
        <table className="reports-agent-table">
          <thead>
            <tr>
              <th scope="col" className="reports-col-agent">Agent</th>
              <th scope="col" className="reports-col-metric">Resolved</th>
              <th scope="col" className="reports-col-metric">First response</th>
              <th scope="col" className="reports-col-metric">SLA met</th>
              <th scope="col" className="reports-col-metric">CSAT / 5</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => {
              const initials = getInitials(agent.agent_name);
              const resolvedStr = String(agent.resolved ?? 0);
              const firstRespStr = formatDuration(agent.avg_first_response_hours);
              const slaMetStr = formatPct(agent.sla_met_pct, 0);
              const csatStr = formatCsat(agent.csat_avg);

              return (
                <tr key={agent.agent_id}>
                  {/* Agent column: Avatar + Name */}
                  <td className="reports-cell-agent">
                    <div className="reports-agent-info">
                      <Avatar
                        initials={initials}
                        type="text"
                        size="sm"
                        className="reports-agent-avatar"
                      />
                      <span className="reports-agent-name" title={agent.agent_name}>
                        {agent.agent_name}
                      </span>
                    </div>
                  </td>

                  {/* Metrics */}
                  <td className="reports-cell-metric tabular-nums">
                    {resolvedStr}
                  </td>
                  <td className="reports-cell-metric tabular-nums">
                    {firstRespStr}
                  </td>
                  <td className="reports-cell-metric tabular-nums">
                    {slaMetStr}
                  </td>
                  <td className="reports-cell-metric tabular-nums">
                    {csatStr}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

