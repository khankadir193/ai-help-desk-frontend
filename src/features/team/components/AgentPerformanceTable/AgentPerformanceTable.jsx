import Avatar from '../../../../components/Avatar/Avatar';
import getInitials from '../../../dashboard/utils/initials';
import { formatDuration, formatPct, formatCsat } from '../../utils/teamFormatters';
import './AgentPerformanceTable.css';

export default function AgentPerformanceTable({
  agents = [],
  metaText,
  footnote,
  isLoading,
}) {
  if (isLoading) {
    return (
      <section className="agent-perf-card" aria-label="Loading agent performance table">
        <div className="agent-perf-card__header">
          <div className="agent-perf-skeleton-title" />
          <div className="agent-perf-skeleton-meta" />
        </div>
        <div className="agent-perf-table-wrapper" aria-hidden="true">
          <table className="agent-perf-table">
            <thead>
              <tr>
                <th scope="col" className="agent-perf-th agent-perf-th--agent">Agent</th>
                <th scope="col" className="agent-perf-th agent-perf-th--metric">Open now</th>
                <th scope="col" className="agent-perf-th agent-perf-th--metric">Resolved</th>
                <th scope="col" className="agent-perf-th agent-perf-th--metric">First response</th>
                <th scope="col" className="agent-perf-th agent-perf-th--metric">Resolution</th>
                <th scope="col" className="agent-perf-th agent-perf-th--metric">SLA met</th>
                <th scope="col" className="agent-perf-th agent-perf-th--metric">CSAT / 5</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(4)].map((_, i) => (
                <tr key={i} className="agent-perf-tr--skeleton">
                  <td colSpan={7}>
                    <div className="agent-perf-skeleton-row" />
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
    <>
      <section className="agent-perf-card" aria-label="Agent performance">
        <div className="agent-perf-card__header">
          <h2 className="agent-perf-card__title">Agent performance</h2>
          {metaText && <span className="agent-perf-card__meta">{metaText}</span>}
        </div>

        <div
          className="agent-perf-table-wrapper"
          tabIndex={0}
          role="region"
          aria-label="Agent performance table"
        >
          <table className="agent-perf-table">
            <thead>
              <tr>
                <th scope="col" className="agent-perf-th agent-perf-th--agent">Agent</th>
                <th scope="col" className="agent-perf-th agent-perf-th--metric">Open now</th>
                <th scope="col" className="agent-perf-th agent-perf-th--metric">Resolved</th>
                <th scope="col" className="agent-perf-th agent-perf-th--metric">First response</th>
                <th scope="col" className="agent-perf-th agent-perf-th--metric">Resolution</th>
                <th scope="col" className="agent-perf-th agent-perf-th--metric">SLA met</th>
                <th scope="col" className="agent-perf-th agent-perf-th--metric">CSAT / 5</th>
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="agent-perf-empty">
                    No agent performance records available for this period.
                  </td>
                </tr>
              ) : (
                agents.map((agent) => {
                  const initials = getInitials(agent.agent_name);
                  const openNowStr = agent.open_now != null ? String(agent.open_now) : '–';
                  const resolvedStr = agent.resolved != null ? String(agent.resolved) : '–';
                  const firstRespStr = formatDuration(agent.avg_first_response_hours);
                  const resTimeStr = formatDuration(agent.avg_resolution_hours);
                  const slaMetStr = formatPct(agent.sla_met_pct, 0);
                  const csatStr = formatCsat(agent.csat_avg);

                  return (
                    <tr key={agent.agent_id} className="agent-perf-tr">
                      {/* Agent column: Avatar + Name with ellipsis and title tooltip */}
                      <td className="agent-perf-td agent-perf-td--agent">
                        <div className="agent-perf-cell-content">
                          <Avatar
                            initials={initials}
                            type="text"
                            size="sm"
                            className="agent-perf-avatar"
                          />
                          <span className="agent-perf-name" title={agent.agent_name}>
                            {agent.agent_name}
                          </span>
                        </div>
                      </td>

                      <td className="agent-perf-td agent-perf-td--metric tabular-nums">
                        {openNowStr}
                      </td>
                      <td className="agent-perf-td agent-perf-td--metric tabular-nums">
                        {resolvedStr}
                      </td>
                      <td className="agent-perf-td agent-perf-td--metric tabular-nums">
                        {firstRespStr}
                      </td>
                      <td className="agent-perf-td agent-perf-td--metric tabular-nums">
                        {resTimeStr}
                      </td>
                      <td className="agent-perf-td agent-perf-td--metric tabular-nums">
                        {slaMetStr}
                      </td>
                      <td className="agent-perf-td agent-perf-td--metric tabular-nums">
                        {csatStr}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {footnote && (
        <p className="agent-perf-footnote">
          {footnote}
        </p>
      )}
    </>
  );
}
