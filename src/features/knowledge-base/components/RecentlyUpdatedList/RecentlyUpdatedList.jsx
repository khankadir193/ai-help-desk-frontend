import { Link } from 'react-router-dom';
import StatusBadge from '../StatusBadge/StatusBadge';
import { formatDate } from '../../utils/kbUtils';
import './RecentlyUpdatedList.css';

export default function RecentlyUpdatedList({ articles = [], isLoading }) {
  return (
    <div className="kb-recent-card">
      <h2 className="kb-recent-card__header">Recently updated</h2>
      {isLoading ? (
        <div className="kb-recent-card__loading">Loading recently updated articles...</div>
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

