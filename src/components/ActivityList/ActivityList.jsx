import Avatar from '../Avatar/Avatar';
import StatusPill from '../StatusPill/StatusPill';
import { recentActivityData } from '../../data/dashboardData';
import './ActivityList.css';

export default function ActivityList() {
  return (
    <div className="activity-card">
      <div className="activity-card__header">
        <h3 className="activity-card__title">Recent ticket activity</h3>
        <button type="button" className="activity-card__view-all-btn">
          View all
        </button>
      </div>

      <div className="activity-card__list">
        {recentActivityData.map((item) => (
          <div key={item.id} className="activity-card__item">
            <Avatar
              initials={item.avatar}
              type={item.avatarType}
              icon="sparkle"
              size="lg"
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
    </div>
  );
}

