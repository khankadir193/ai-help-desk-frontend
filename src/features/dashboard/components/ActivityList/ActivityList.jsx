import { useNavigate } from 'react-router-dom';
import Avatar from '../../../../components/Avatar/Avatar';
import StatusPill from '../../../../components/StatusPill/StatusPill';
import './ActivityList.css';

export default function ActivityList({
  data = [],
  title = 'Recent ticket activity',
  emptyText,
}) {
  const navigate = useNavigate();

  return (
    <div className="activity-card">
      <div className="activity-card__header">
        <h3 className="activity-card__title">{title}</h3>
        {data.length > 0 && (
          <button
            type="button"
            className="activity-card__view-all-btn"
            onClick={() => navigate('/tickets')}
          >
            View all
          </button>
        )}
      </div>

      {!data || data.length === 0 ? (
        <p className="activity-card__empty">
          {emptyText || 'No tickets to show yet.'}
        </p>
      ) : (
        <div className="activity-card__list">
          {data.map((item) => (
            <div key={item.id} className="activity-card__item">
              <Avatar
                initials={item.avatar}
                type={item.avatarType}
                icon="sparkle"
                size="md"
              />

              <div className="activity-card__main">
                <div className="activity-card__line">
                  <span className="activity-card__actor">{item.actor}</span>{' '}
                  <span className="activity-card__action">{item.action}</span>{' '}
                  <span className="activity-card__ticket-id">{item.ticketId}</span>
                </div>
                <div className="activity-card__subtitle">{item.subtitle}</div>
              </div>

              <div className="activity-card__meta">
                <StatusPill status={item.status} label={item.statusLabel} />
                <span className="activity-card__time tabular-nums">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
