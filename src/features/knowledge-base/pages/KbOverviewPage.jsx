import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/Icon/Icon';
import KbHeader from '../components/KbHeader/KbHeader';
import KbTabs from '../components/KbTabs/KbTabs';
import KbStatCards from '../components/KbStatCards/KbStatCards';
import CategoryCard from '../components/CategoryCard/CategoryCard';
import RecentlyUpdatedList from '../components/RecentlyUpdatedList/RecentlyUpdatedList';
import PopularArticles from '../components/PopularArticles/PopularArticles';
import KbCategoryCardsSkeleton from '../components/skeletons/KbCategoryCardsSkeleton';
import { useKbOverview } from '../hooks/useKbOverview';
import { useDelayedSkeleton } from '../hooks/useDelayedSkeleton';
import './KbOverviewPage.css';

export default function KbOverviewPage() {
  const navigate = useNavigate();
  const [keywordSearch, setKeywordSearch] = useState('');
  const { data, isLoading, isError, error, refetch, isFetching } = useKbOverview();
  const showSkeleton = useDelayedSkeleton(isLoading);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keywordSearch.trim()) {
      navigate(`/knowledge-base/articles?q=${encodeURIComponent(keywordSearch.trim())}`);
    } else {
      navigate('/knowledge-base/articles');
    }
  };

  const stats = data?.stats;
  const categories = data?.categories || [];
  const recentlyUpdated = data?.recentlyUpdated || [];
  const popularArticles = data?.popularArticles || [];

  const showPlaceholders = isLoading || showSkeleton;
  const isRefetching = isFetching && !isLoading && !isError;

  return (
    <main className="kb-page kb-overview-page" aria-label="Knowledge Base Overview">
      {isRefetching && <div className="kb-refetch-bar" aria-hidden="true" />}
      <div className={isRefetching ? 'kb-refetching' : undefined}>
        {/* Header */}
        <KbHeader
          title="Knowledge Base"
          subtitle="Trusted answers for your customers and support team."
          actions={
            <button
              type="button"
              className="kb-primary-btn"
              onClick={() => navigate('/knowledge-base/articles/new')}
            >
              Create article
            </button>
          }
        />

        {/* Tabs */}
        <KbTabs />

        {/* Error state with retry */}
        {isError && (
          <div className="kb-error-box" role="alert">
            <Icon name="alert-circle" size={20} className="kb-error-icon" />
            <div className="kb-error-text">
              <strong>Failed to load overview data:</strong> {error?.message || 'Server error occurred'}
            </div>
            <button type="button" className="kb-retry-btn" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        )}

        {/* 4 Stat Cards */}
        <KbStatCards stats={stats} isLoading={showPlaceholders} />

        {/* Browse by category */}
        <section className="kb-browse-section" aria-labelledby="browse-by-cat-heading">
          <div className="kb-browse-header">
            <h2 id="browse-by-cat-heading" className="kb-browse-title">
              Browse by category
            </h2>

            <form onSubmit={handleSearchSubmit} className="kb-browse-search">
              <Icon name="search" size={16} className="kb-browse-search-icon" />
              <input
                type="text"
                className="kb-browse-search-input"
                placeholder="Search articles by title or keyword..."
                value={keywordSearch}
                onChange={(e) => setKeywordSearch(e.target.value)}
                aria-label="Search articles by title or keyword"
              />
              {keywordSearch && (
                <button
                  type="button"
                  className="kb-browse-search-clear"
                  onClick={() => setKeywordSearch('')}
                  aria-label="Clear search"
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </form>
          </div>

          {showPlaceholders ? (
            <KbCategoryCardsSkeleton count={6} />
          ) : (
            <div className="kb-category-grid">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          )}
        </section>

        {/* Bottom 2-Column Grid (Recently updated 2fr, Popular articles 1fr) */}
        <section className="kb-bottom-grid">
          <div className="kb-bottom-grid__left">
            <RecentlyUpdatedList
              articles={recentlyUpdated}
              isLoading={showPlaceholders}
            />
          </div>
          <div className="kb-bottom-grid__right">
            <PopularArticles
              articles={popularArticles}
              isLoading={showPlaceholders}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
