import Avatar from '../Avatar/Avatar';
import './TeamTable.css';

const STATUS_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const getInitials = (name) => {
  const source = typeof name === 'string' ? name.trim() : '';
  if (!source) return 'U';
  const parts = source.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function TeamTable({ data = [], title = 'Team performance', emptyText }) {
  return (
    <div className="team-card">
      <div className="team-card__header">
        <h3 className="team-card__title">{title}</h3>
        <button type="button" className="team-card__full-report-btn">
          Full report
        </button>
      </div>

      {(!data || data.length === 0) ? (
        <p className="team-card__empty">{emptyText || 'No agents to show yet.'}</p>
      ) : (
        <div className="team-card__table-wrapper">
          <table className="team-table">
            <thead>
              <tr>
                <th className="team-table__th team-table__th--agent">Agent</th>
                <th className="team-table__th team-table__th--metric">Total</th>
                <th className="team-table__th team-table__th--metric">
                  {STATUS_LABELS.OPEN}
                </th>
                <th className="team-table__th team-table__th--metric">In prog.</th>
                <th className="team-table__th team-table__th--metric">
                  {STATUS_LABELS.RESOLVED}
                </th>
                <th className="team-table__th team-table__th--metric">
                  {STATUS_LABELS.CLOSED}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((agent) => (
                <tr key={agent.id} className="team-table__row">
                  <td className="team-table__td team-table__td--agent">
                    <div className="team-table__agent-cell">
                      <Avatar initials={getInitials(agent.agent_name)} size="sm" />
                      <span className="team-table__agent-name">{agent.agent_name}</span>
                    </div>
                  </td>
                  <td className="team-table__td team-table__td--metric tabular-nums">
                    {agent.total_assigned}
                  </td>
                  <td className="team-table__td team-table__td--metric tabular-nums">
                    {agent.open}
                  </td>
                  <td className="team-table__td team-table__td--metric tabular-nums">
                    {agent.in_progress}
                  </td>
                  <td className="team-table__td team-table__td--metric tabular-nums">
                    {agent.resolved}
                  </td>
                  <td className="team-table__td team-table__td--metric tabular-nums team-table__td--csat">
                    {agent.closed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
