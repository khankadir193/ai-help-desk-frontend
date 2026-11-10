import { Link } from 'react-router-dom';
import './PopularArticles.css';

export default function PopularArticles({ articles = [], isLoading }) {
  return (
    <div className="kb-popular-card">
      <div className="kb-popular-card__header-group">
        <h2 className="kb-popular-card__header">Popular articles</h2>
        <p className="kb-popular-card__caption">Most viewed · Last 30 days</p>
      </div>

      {isLoading ? (
        <div className="kb-popular-card__loading">Loading popular articles...</div>
      ) : articles.length === 0 ? (
        <div className="kb-popular-card__empty">No popular articles recorded yet.</div>
      ) : (
        <ul className="kb-popular-list">
          {articles.map((article) => {
            const formattedViews = Number(article.view_count || 0).toLocaleString();
            return (
              <li key={article.id || article.article_id} className="kb-popular-item">
                <Link
                  to={`/knowledge-base/articles/${article.article_id || article.id}`}
                  className="kb-popular-item__title"
                >
                  {article.title}
                </Link>
                <div className="kb-popular-item__meta">
                  {formattedViews} views · {article.helpfulRate ?? 94}% helpful
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

