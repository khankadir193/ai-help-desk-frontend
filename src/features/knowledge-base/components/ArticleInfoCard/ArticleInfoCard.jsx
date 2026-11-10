import { formatDate } from '../../utils/kbUtils';
import './ArticleInfoCard.css';

export default function ArticleInfoCard({ article }) {
  if (!article) return null;

  const tagsString = Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags || '–');
  const publishedDate = article.published_at ? formatDate(article.published_at) : 'Draft (Not published)';
  const authorName = article.author_name || article.author || 'Maya Chen';
  const visibilityLabel = article.visibility === 'INTERNAL' ? 'Internal workspace only' : 'Public help center';

  return (
    <div className="kb-info-card">
      <h3 className="kb-info-card__title">Article information</h3>

      <div className="kb-info-card__group">
        <span className="kb-info-card__label">Article ID</span>
        <span className="kb-info-card__value">{article.article_id || '–'}</span>
      </div>

      <div className="kb-info-card__group">
        <span className="kb-info-card__label">Category</span>
        <span className="kb-info-card__value">{article.category_name || article.category || '–'}</span>
      </div>

      <div className="kb-info-card__group">
        <span className="kb-info-card__label">Visibility</span>
        <span className="kb-info-card__value">{visibilityLabel}</span>
      </div>

      <div className="kb-info-card__group">
        <span className="kb-info-card__label">Tags</span>
        <span className="kb-info-card__value">{tagsString || '–'}</span>
      </div>

      <div className="kb-info-card__group">
        <span className="kb-info-card__label">Published</span>
        <span className="kb-info-card__value">
          {publishedDate} {article.published_at ? `· ${authorName}` : ''}
        </span>
      </div>
    </div>
  );
}

