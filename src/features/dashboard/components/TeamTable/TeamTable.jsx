import { useNavigate } from 'react-router-dom';
import Avatar from '../../../../components/Avatar/Avatar';
import getInitials from '../../utils/initials';
import { formatDuration } from '../../utils/formatters';
import './TeamTable.css';

/**
 * TeamTable — Team performance card shown for ADMIN role.
 *
 * Uses only fields the dashboard API actually returns:
 *   { agent_id, agent_name, total_assigned, open, in_progress,
 *     resolved, closed, avg_first_response_hours }
 *
 * Solved  = resolved + closed
 * Active  = open + in_progress
 * Avg. reply = avg_first_response_hours (null renders as "–")
 */
export default function TeamTable({
  data = [],
  title = 'Team performance',
  emptyText,
  isLoading = false,
}) {
  const navigate = useNavigate();

  return (
    <div className="team-card">
      <div className="team-card__header">
        <h3 className="team-card__title">{title}</h3>
        {data && data.length > 0 && (
          <button
            type="button"
            className="team-card__full-report-btn"
            onClick={() => navigate('/reports')}
          >
            Full report
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="team-card__table-wrapper" aria-hidden="true">
          <table className="team-table">
            <thead>
              <tr>
                <th className="team-table__th team-table__th--agent">Agent</th>
                <th className="team-table__th team-table__th--metric">Solved</th>
                <th className="team-table__th team-table__th--metric">Active</th>
                <th className="team-table__th team-table__th--metric">Avg. reply</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(4)].map((_, i) => (
                <tr key={i} className="team-table__row team-table__row--skeleton">
                  <td className="team-table__td team-table__td--agent">
                    <div className="team-table__agent-cell">
                      <div className="team-table__skeleton-avatar" />
                      <div className="team-table__skeleton-name" />
                    </div>
                  </td>
                  <td className="team-table__td team-table__td--metric">
                    <div className="team-table__skeleton-stat" />
                  </td>
                  <td className="team-table__td team-table__td--metric">
                    <div className="team-table__skeleton-stat" />
                  </td>
                  <td className="team-table__td team-table__td--metric">
                    <div className="team-table__skeleton-stat" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !data || data.length === 0 ? (
        <p className="team-card__empty">{emptyText || 'No agents to show yet.'}</p>
      ) : (
        <div
          className="team-card__table-wrapper"
          tabIndex={0}
          role="region"
          aria-label="Team performance agents"
        >
          <table className="team-table">
            <thead>
              <tr>
                <th className="team-table__th team-table__th--agent">Agent</th>
                <th className="team-table__th team-table__th--metric">Solved</th>
                <th className="team-table__th team-table__th--metric">Active</th>
                <th className="team-table__th team-table__th--metric">Avg. reply</th>
              </tr>
            </thead>
            <tbody>
              {data.map((agent) => {
                const solved =
                  (agent.resolved ?? 0) + (agent.closed ?? 0);
                const active =
                  (agent.open ?? 0) + (agent.in_progress ?? 0);
                const avgReply = formatDuration(agent.avg_first_response_hours);

                return (
                  <tr key={agent.agent_id ?? agent.agent_name} className="team-table__row">
                    <td className="team-table__td team-table__td--agent">
                      <div className="team-table__agent-cell">
                        <Avatar initials={getInitials(agent.agent_name)} size="sm" />
                        <span className="team-table__agent-name" title={agent.agent_name}>
                          {agent.agent_name}
                        </span>
                      </div>
                    </td>
                    <td className="team-table__td team-table__td--metric tabular-nums">
                      {solved}
                    </td>
                    <td className="team-table__td team-table__td--metric tabular-nums">
                      {active}
                    </td>
                    <td className="team-table__td team-table__td--metric tabular-nums">
                      {avgReply}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
