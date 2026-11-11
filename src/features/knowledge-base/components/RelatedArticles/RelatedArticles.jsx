import { Link } from 'react-router-dom';
import Icon from '../../../../components/Icon/Icon';
import './RelatedArticles.css';

const RELATED_ROW_SKELETONS = [88, 66, 78];

export default function RelatedArticles({ articles = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="kb-related-card">
        <h3 className="kb-related-card__title">Related articles</h3>
        <ul className="kb-related-list" aria-hidden="true">
          {RELATED_ROW_SKELETONS.map((width) => (
            <li key={width} className="kb-related-item">
              <span className="kb-skel" style={{ width: `${width}%`, height: 14 }} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!articles || articles.length === 0) return null;

  return (
    <div className="kb-related-card">
      <h3 className="kb-related-card__title">Related articles</h3>
      <ul className="kb-related-list">
        {articles.map((item) => (
          <li key={item.id || item.article_id} className="kb-related-item">
            <Link
              to={`/knowledge-base/articles/${item.article_id || item.id}`}
              className="kb-related-link"
            >
              <span className="kb-related-link__text">{item.title}</span>
              <Icon name="arrow-up-right" size={14} className="kb-related-link__icon" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
