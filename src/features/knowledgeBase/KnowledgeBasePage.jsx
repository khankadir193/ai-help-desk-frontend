import { useEffect, useMemo, useState } from 'react';
import Icon from '../../components/Icon/Icon';
import Button from '../../components/ui/Button/Button';
import Spinner from '../../components/feedback/Spinner/Spinner';
import ArticleCard from './components/ArticleCard';
import ArticleDetail from './components/ArticleDetail';
import {
  useKnowledgeBaseArticles,
  useKnowledgeBaseCategories,
} from './hooks/useKnowledgeBase';
import { getKbCategoryColors } from './data/kbSeedData';
import { getErrorMessage } from '../../utils/errorHandler';
import styles from './KnowledgeBasePage.module.css';

const flattenArticleText = (article) =>
  [article.title, article.excerpt, ...(article.tags ?? [])]
    .join(' ')
    .concat(
      ' ',
      (article.content ?? [])
        .map((block) =>
          block.type === 'list' ? block.items.join(' ') : (block.text ?? '')
        )
        .join(' ')
    );

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedSlug, setSelectedSlug] = useState(null);

  const {
    data: articles = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useKnowledgeBaseArticles();
  const { data: categories = [] } = useKnowledgeBaseCategories();

  // Scroll window to top when entering article detail (and on mount)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: selectedSlug ? 'smooth' : 'auto' });
  }, [selectedSlug]);

  const openArticle = (slug) => setSelectedSlug(slug);
  const goBack = () => setSelectedSlug(null);

  const resetView = () => {
    setSearchQuery('');
    setActiveCategory('all');
  };

  const isFiltered = searchQuery.trim() !== '' || activeCategory !== 'all';

  const filteredArticles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return articles.filter((article) => {
      const matchesCategory =
        activeCategory === 'all' || article.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return flattenArticleText(article).includes(q);
    });
  }, [articles, searchQuery, activeCategory]);

  const featuredArticle = useMemo(
    () => articles.find((entry) => entry.featured) ?? articles[0] ?? null,
    [articles]
  );

  const categoriesWithCounts = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        count: articles.filter((entry) => entry.category === category.id).length,
      })),
    [categories, articles]
  );

  // ---- Article detail view ----
  if (selectedSlug) {
    return (
      <div className={styles.container}>
        <ArticleDetail slug={selectedSlug} onBack={goBack} onOpenRelated={openArticle} />
      </div>
    );
  }

  // ---- Browse view ----
  return (
    <div className={styles.container}>
      {/* Hero with search */}
      <section className={styles.hero}>
        <div className={styles.heroIcon}>
          <Icon name="book-open" size={26} strokeWidth={2} />
        </div>
        <h1 className={styles.heroTitle}>How can we help?</h1>
        <p className={styles.heroSubtitle}>
          Browse guides or search the knowledge base to get answers fast.
        </p>

        <div className={styles.searchBox}>
          <Icon name="search" size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search articles by keyword or topic..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search knowledge base articles"
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <Icon name="x" size={15} />
            </button>
          )}
        </div>

        <p className={styles.heroNote}>
          <Icon name="alert-circle" size={13} />
          Sample content — live Knowledge Base backend API not yet available.
        </p>
      </section>

      {/* Category browsing */}
      <nav
        className={styles.categoryRow}
        aria-label="Browse knowledge base by category"
      >
        <button
          type="button"
          className={`${styles.categoryChip} ${
            activeCategory === 'all' ? styles.categoryChipActive : ''
          }`}
          onClick={() => setActiveCategory('all')}
          aria-pressed={activeCategory === 'all'}
        >
          <Icon name="book-open" size={14} strokeWidth={2} />
          All articles
        </button>

        {categoriesWithCounts.map((category) => {
          const colors = getKbCategoryColors(category);
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              className={`${styles.categoryChip} ${
                isActive ? styles.categoryChipActive : ''
              }`}
              onClick={() => setActiveCategory(category.id)}
              aria-pressed={isActive}
            >
              <Icon name={category.icon} size={14} strokeWidth={2} />
              {category.name}
              <span className={styles.categoryCount}>{category.count}</span>
              {!isActive && (
                <span
                  className={styles.categoryDot}
                  style={{ backgroundColor: colors.text }}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Loading state */}
      {isLoading ? (
        <div className={styles.stateBox}>
          <Spinner size="lg" label="Loading knowledge base..." />
        </div>
      ) : isError ? (
        <div className={styles.stateBox}>
          <Icon name="alert-circle" size={36} className={styles.stateIcon} />
          <h2 className={styles.stateTitle}>Something went wrong</h2>
          <p className={styles.stateText}>{getErrorMessage(error)}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <Icon name="rotate-cw" size={14} />
            Try again
          </Button>
        </div>
      ) : (
        <>
          {/* Featured article (only on unfiltered view) */}
          {!isFiltered && featuredArticle && (
            <ArticleCard article={featuredArticle} onOpen={openArticle} />
          )}

          {/* Results */}
          {filteredArticles.length === 0 ? (
            <div className={styles.stateBox}>
              <Icon name="search" size={36} className={styles.stateIcon} />
              <h2 className={styles.stateTitle}>No articles found</h2>
              <p className={styles.stateText}>
                {searchQuery.trim()
                  ? `No articles matched "${searchQuery.trim()}". Try different keywords.`
                  : 'No articles available in this category yet.'}
              </p>
              <Button variant="secondary" size="sm" onClick={resetView}>
                Clear filters
              </Button>
            </div>
          ) : (
            <section className={styles.resultsSection} aria-live="polite">
              <div className={styles.resultsHeader}>
                <h2 className={styles.resultsTitle}>
                  {activeCategory === 'all' ? 'All articles' : categories.find((category) => category.id === activeCategory)?.name}
                </h2>
                <div className={styles.resultsMeta}>
                  <span className={styles.resultsCount}>
                    {filteredArticles.length}{' '}
                    {filteredArticles.length === 1 ? 'article' : 'articles'}
                  </span>
                  <button
                    type="button"
                    className={styles.refreshBtn}
                    onClick={() => refetch()}
                    title="Refresh articles"
                    aria-label="Refresh articles"
                    disabled={isFetching}
                  >
                    <Icon
                      name="rotate-cw"
                      size={15}
                      className={isFetching ? 'spin' : ''}
                    />
                  </button>
                </div>
              </div>

              <div className={styles.grid}>
                {(isFiltered
                  ? filteredArticles
                  : filteredArticles.filter((article) => article.slug !== featuredArticle?.slug)
                ).map((article) => (
                  <ArticleCard key={article.slug} article={article} onOpen={openArticle} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
