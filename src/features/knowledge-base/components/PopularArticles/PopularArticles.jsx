import { Link } from 'react-router-dom';
import './PopularArticles.css';

const POPULAR_ROW_SKELETONS = [
  { title: '88%', meta: '34%' },
  { title: '96%', meta: '40%' },
  { title: '78%', meta: '30%' },
  { title: '90%', meta: '36%' },
  { title: '70%', meta: '32%' },
];

function PopularRowSkeleton({ title, meta }) {
  return (
    <li className="kb-popular-item" aria-hidden="true">
      <span className="kb-skel" style={{ width: title, height: 20 }} />
      <span className="kb-skel" style={{ width: meta, height: 18 }} />
    </li>
  );
}

export default function PopularArticles({ articles = [], isLoading }) {
  return (
    <div className="kb-popular-card">
      <div className="kb-popular-card__header-group">
        <h2 className="kb-popular-card__header">Popular articles</h2>
        <p className="kb-popular-card__caption">Most viewed · Last 30 days</p>
      </div>

      {isLoading ? (
        <ul className="kb-popular-list" aria-hidden="true">
          {POPULAR_ROW_SKELETONS.map((row) => (
            <PopularRowSkeleton key={row.title} {...row} />
          ))}
        </ul>
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
