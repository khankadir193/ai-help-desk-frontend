import Avatar from '../Avatar/Avatar';
import { teamPerformanceData } from '../../data/dashboardData';
import './TeamTable.css';

export default function TeamTable() {
  return (
    <div className="team-card">
      <div className="team-card__header">
        <h3 className="team-card__title">Team performance</h3>
        <button type="button" className="team-card__full-report-btn">
          Full report
        </button>
      </div>

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
            {teamPerformanceData.map((agent) => (
              <tr key={agent.id} className="team-table__row">
                <td className="team-table__td team-table__td--agent">
                  <div className="team-table__agent-cell">
                    <Avatar initials={agent.avatar} size="sm" />
                    <span className="team-table__agent-name">{agent.name}</span>
                  </div>
                </td>
                <td className="team-table__td team-table__td--metric tabular-nums">
                  {agent.solved}
                </td>
                <td className="team-table__td team-table__td--metric tabular-nums">
                  {agent.resp}
                </td>
                <td className="team-table__td team-table__td--metric tabular-nums team-table__td--csat">
                  {agent.csat.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

