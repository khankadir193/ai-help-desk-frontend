import { useNavigate } from 'react-router-dom';
import Icon from '../../../../components/Icon/Icon';
import './CategoryCard.css';

export default function CategoryCard({ category }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/knowledge-base/articles?category=${encodeURIComponent(category.slug || category.id)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const iconName = category.icon || 'book-open';
  const totalCount = category.total_count ?? category.total ?? 0;
  const publishedCount = category.published_count ?? category.published ?? 0;

  return (
    <div
      className="kb-category-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Browse ${category.name} articles. ${totalCount} articles, ${publishedCount} published.`}
    >
      <div className="kb-category-card__icon" aria-hidden="true">
        <Icon name={iconName} size={20} strokeWidth={1.75} />
      </div>
      <h3 className="kb-category-card__title">{category.name}</h3>
      <p className="kb-category-card__description">{category.description || 'Guides, instructions and best practices'}</p>
      <div className="kb-category-card__footer">
        {totalCount} articles · {publishedCount} published
      </div>
    </div>
  );
}

