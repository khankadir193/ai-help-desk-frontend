import { Link } from 'react-router-dom';
import StatusBadge from '../StatusBadge/StatusBadge';
import SkeletonBlock from '../skeletons/SkeletonBlock';
import { formatDate } from '../../utils/kbUtils';
import './RecentlyUpdatedList.css';

const RECENT_ROW_SKELETONS = [
  { title: '66%', meta: '46%', badge: 78 },
  { title: '58%', meta: '52%', badge: 60 },
  { title: '72%', meta: '40%', badge: 84 },
  { title: '52%', meta: '44%', badge: 66 },
  { title: '64%', meta: '48%', badge: 72 },
];

function RecentRowSkeleton({ title, meta, badge }) {
  return (
    <div className="kb-recent-item" aria-hidden="true">
      <div className="kb-recent-item__main">
        <span className="kb-skel" style={{ width: title, height: 14, marginBottom: 4 }} />
        <span className="kb-skel" style={{ width: meta, height: 13 }} />
      </div>
      <div className="kb-recent-item__badge">
        <span className="kb-skel" style={{ width: badge, height: 22, borderRadius: 999 }} />
      </div>
    </div>
  );
}

export default function RecentlyUpdatedList({ articles = [], isLoading }) {
  return (
    <div className="kb-recent-card">
      <h2 className="kb-recent-card__header">Recently updated</h2>
      {isLoading ? (
        <div className="kb-recent-list" aria-hidden="true">
          {RECENT_ROW_SKELETONS.map((row) => (
            <RecentRowSkeleton key={row.title} {...row} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="kb-recent-card__empty">No recent articles found.</div>
      ) : (
        <ul className="kb-recent-list">
          {articles.map((article) => {
            const formattedDate = formatDate(article.updated_at);
            return (
              <li key={article.id || article.article_id} className="kb-recent-item">
                <div className="kb-recent-item__main">
                  <Link
                    to={`/knowledge-base/articles/${article.article_id || article.id}`}
                    className="kb-recent-item__title"
                  >
                    {article.title}
                  </Link>
                  <div className="kb-recent-item__meta">
                    <span>{article.category || 'General'}</span>
                    <span className="kb-recent-item__separator">·</span>
                    <span>{article.author || 'Support Team'}</span>
                    <span className="kb-recent-item__separator">·</span>
                    <span>{formattedDate}</span>
                  </div>
                </div>
                <div className="kb-recent-item__badge">
                  <StatusBadge status={article.status} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
