import { useNavigate } from 'react-router-dom';
import Avatar from '../../../../components/Avatar/Avatar';
import getInitials from '../../utils/initials';
import './TeamTable.css';

/**
 * TeamTable — Team performance card shown for ADMIN role.
 *
 * Maps agent_workload from the backend:
 *   { agent_id, agent_name, total_assigned, open, in_progress, resolved, closed }
 *
 * Reference columns: Agent | Solved | Resp. | CSAT
 *   • Solved  → agent.resolved   (resolved tickets count)
 *   • Resp.   → derived as open + in_progress (pending response proxy)
 *   • CSAT    → not in backend yet; shown as "—"
 */
export default function TeamTable({ data = [], title = 'Team performance', emptyText }) {
  const navigate = useNavigate();

  return (
    <div className="team-card">
      <div className="team-card__header">
        <h3 className="team-card__title">{title}</h3>
        {data.length > 0 && (
          <button
            type="button"
            className="team-card__full-report-btn"
            onClick={() => navigate('/reports')}
          >
            Full report
          </button>
        )}
      </div>

      {!data || data.length === 0 ? (
        <p className="team-card__empty">{emptyText || 'No agents to show yet.'}</p>
      ) : (
        <div className="team-card__table-wrapper">
          <table className="team-table">
            <thead>
              <tr>
                <th className="team-table__th team-table__th--agent">Agent</th>
                <th className="team-table__th team-table__th--metric">Solved</th>
                <th className="team-table__th team-table__th--metric">Resp.</th>
                <th className="team-table__th team-table__th--metric">CSAT</th>
              </tr>
            </thead>
            <tbody>
              {data.map((agent) => {
                const pending = (agent.open ?? 0) + (agent.in_progress ?? 0);
                return (
                  <tr key={agent.agent_id ?? agent.agent_name} className="team-table__row">
                    <td className="team-table__td team-table__td--agent">
                      <div className="team-table__agent-cell">
                        <Avatar initials={getInitials(agent.agent_name)} size="sm" />
                        <span className="team-table__agent-name">{agent.agent_name}</span>
                      </div>
                    </td>
                    <td className="team-table__td team-table__td--metric tabular-nums">
                      {agent.resolved ?? 0}
                    </td>
                    <td className="team-table__td team-table__td--metric tabular-nums">
                      {pending}
                    </td>
                    <td className="team-table__td team-table__td--metric team-table__td--csat tabular-nums">
                      —
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
