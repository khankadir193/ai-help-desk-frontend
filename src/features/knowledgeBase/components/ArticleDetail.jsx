import Icon from '../../../components/Icon/Icon';
import Button from '../../../components/ui/Button/Button';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import ArticleCard from './ArticleCard';
import { useKnowledgeBaseArticle, useKnowledgeBaseArticles } from '../hooks/useKnowledgeBase';
import { getKbCategory, getKbCategoryColors } from '../data/kbSeedData';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from './ArticleDetail.module.css';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

function ArticleBlocks({ blocks }) {
  return (
    <div className={styles.content}>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h2 key={index} className={styles.contentHeading}>
              {block.text}
            </h2>
          );
        }
        if (block.type === 'list') {
          return (
            <ul key={index} className={styles.contentList}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === 'tip') {
          return (
            <div key={index} className={styles.tipBox}>
              <Icon name="lightbulb" size={17} />
              <p>{block.text}</p>
            </div>
          );
        }
        return (
          <p key={index} className={styles.contentParagraph}>
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

export default function ArticleDetail({ slug, onBack, onOpenRelated }) {
  const {
    data: article,
    isLoading,
    isError,
    error,
    refetch,
  } = useKnowledgeBaseArticle(slug);
  const { data: allArticles = [] } = useKnowledgeBaseArticles();

  const related = article
    ? allArticles
        .filter((entry) => entry.category === article.category && entry.slug !== article.slug)
        .slice(0, 3)
    : [];
  const category = article ? getKbCategory(article.category) : null;
  const colors = getKbCategoryColors(category);

  return (
    <div className={styles.container}>
      <button type="button" className={styles.backBtn} onClick={onBack}>
        <Icon name="chevron-left" size={16} />
        Back to Knowledge Base
      </button>

      {isLoading ? (
        <div className={styles.stateBox}>
          <Spinner size="lg" label="Loading article..." />
        </div>
      ) : isError ? (
        <div className={styles.stateBox}>
          <Icon name="alert-circle" size={34} className={styles.stateIcon} />
          <h2 className={styles.stateTitle}>Article not available</h2>
          <p className={styles.stateText}>{getErrorMessage(error)}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <article className={styles.articleCard}>
          <header className={styles.header}>
            <span
              className={styles.categoryPill}
              style={{ backgroundColor: colors.background, color: colors.text }}
            >
              <Icon name={category?.icon ?? 'book-open'} size={13} strokeWidth={2} />
              {category?.name ?? 'General'}
            </span>

            <h1 className={styles.title}>{article.title}</h1>

            <div className={styles.metaRow}>
              <span className={styles.metaItem}>
                <Icon name="clock" size={14} />
                {article.readingTime} min read
              </span>
              <span className={styles.metaItem}>
                <Icon name="rotate-cw" size={14} />
                Last updated {formatDate(article.updatedAt)}
              </span>
            </div>

            {article.tags?.length > 0 && (
              <div className={styles.tagsRow}>
                {article.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className={styles.divider} />

          <ArticleBlocks blocks={article.content} />

          {related.length > 0 && (
            <section className={styles.related} aria-label="Related articles">
              <h2 className={styles.relatedTitle}>Related articles</h2>
              <div className={styles.relatedGrid}>
                {related.map((entry) => (
                  <ArticleCard key={entry.slug} article={entry} onOpen={onOpenRelated} />
                ))}
              </div>
            </section>
          )}
        </article>
      )}
    </div>
  );
}
