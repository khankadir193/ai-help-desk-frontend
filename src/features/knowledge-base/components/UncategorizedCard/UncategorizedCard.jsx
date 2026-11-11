import { Link } from 'react-router-dom';
import './UncategorizedCard.css';

export default function UncategorizedCard({ count = 0, totalArticles = 60, isLoading = false }) {
  const hasUncategorized = count > 0;

  return (
    <div className="kb-uncat-card">
      <div className="kb-uncat-card__text">
        <h3 className="kb-uncat-card__title">Uncategorized articles</h3>
        {isLoading ? (
          <span className="kb-skel" style={{ width: '82%', height: 13, maxWidth: 300 }} aria-hidden="true" />
        ) : (
          <p className="kb-uncat-card__subtitle">
            {hasUncategorized
              ? `${count} articles have no category and need organizing.`
              : `All ${totalArticles} articles have a category. Nothing needs organizing.`}
          </p>
        )}
      </div>

      <div className="kb-uncat-card__count">
        {isLoading ? (
          <span className="kb-skel" style={{ width: 92, height: 14 }} aria-hidden="true" />
        ) : hasUncategorized ? (
          <Link
            to="/knowledge-base/articles?category=uncategorized"
            className="kb-uncat-card__link"
          >
            {count} {count === 1 ? 'article' : 'articles'}
          </Link>
        ) : (
          <span className="kb-uncat-card__badge">0 articles</span>
        )}
      </div>
    </div>
  );
}
