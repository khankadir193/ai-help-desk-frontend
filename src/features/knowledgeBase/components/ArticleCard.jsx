import Icon from '../../../components/Icon/Icon';
import { getKbCategory, getKbCategoryColors } from '../data/kbSeedData';
import styles from './ArticleCard.module.css';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export default function ArticleCard({ article, onOpen }) {
  const category = getKbCategory(article.category);
  const colors = getKbCategoryColors(category);

  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => onOpen(article.slug)}
      aria-label={`Read article: ${article.title}`}
    >
      <div className={styles.cardTop}>
        <span
          className={styles.categoryPill}
          style={{ backgroundColor: colors.background, color: colors.text }}
        >
          <Icon name={category?.icon ?? 'book-open'} size={13} strokeWidth={2} />
          {category?.name ?? 'General'}
        </span>
        {article.featured && (
          <span className={styles.featuredBadge}>
            <Icon name="sparkle" size={12} strokeWidth={2} />
            Featured
          </span>
        )}
      </div>

      <h3 className={styles.title}>{article.title}</h3>
      <p className={styles.excerpt}>{article.excerpt}</p>

      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <Icon name="clock" size={13} />
          {article.readingTime} min read
        </span>
        <span className={styles.metaItem}>
          Updated {formatDate(article.updatedAt)}
        </span>
        <Icon name="arrow-right" size={15} className={styles.arrow} />
      </div>
    </button>
  );
}
