import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/Icon/Icon';
import KbHeader from '../components/KbHeader/KbHeader';
import KbTabs from '../components/KbTabs/KbTabs';
import StatusChips from '../components/StatusChips/StatusChips';
import ArticleFilters from '../components/ArticleFilters/ArticleFilters';
import ArticlesTable from '../components/ArticlesTable/ArticlesTable';
import Pagination from '../components/Pagination/Pagination';
import KbStatusChipsSkeleton from '../components/skeletons/KbStatusChipsSkeleton';
import KbPaginationSkeleton from '../components/skeletons/KbPaginationSkeleton';
import ButtonSpinner from '../components/skeletons/ButtonSpinner';
import { useArticles } from '../hooks/useArticles';
import { useKbCategories } from '../hooks/useCategories';
import './KbArticlesPage.css';

export default function KbArticlesPage() {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const {
    articles,
    total,
    page,
    pageSize,
    totalPages,
    statusCounts,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    search,
    status,
    categoryId,
    authorId,
    sort,
    order,
    setSearch,
    setStatus,
    setCategory,
    setAuthor,
    setPage,
    toggleSort,
    handleExport,
  } = useArticles();

  const {
    categories = [],
    authors = [],
    isLoading: isLoadingCategories,
    isLoadingAuthors,
  } = useKbCategories();

  const isLoadingOptions = isLoadingCategories || isLoadingAuthors;

  const handleResetFilters = () => {
    setSearch('');
    setStatus('ALL');
    setCategory('');
    setAuthor('');
    setPage(1);
  };

  const startExport = () => {
    if (isExporting) return;
    setIsExporting(true);
    Promise.resolve(handleExport()).finally(() => setIsExporting(false));
  };

  const isRefetching = isFetching && !isLoading && !isError;

  return (
    <main className="kb-page kb-articles-page" aria-label="Knowledge Base Articles">
      {isRefetching && <div className="kb-refetch-bar" aria-hidden="true" />}
      <div className={isRefetching ? 'kb-refetching' : undefined}>
        {/* Header */}
        <KbHeader
          title="All articles"
          subtitle="Manage, review and maintain your knowledge base."
          actions={
            <>
              <button
                type="button"
                className="kb-secondary-btn"
                onClick={startExport}
                aria-label="Export articles as CSV"
              >
                {isExporting && <ButtonSpinner label="Exporting articles" />} Export
              </button>
              <button
                type="button"
                className="kb-primary-btn"
                onClick={() => navigate('/knowledge-base/articles/new')}
              >
                Create article
              </button>
            </>
          }
        />

        {/* Tabs */}
        <KbTabs />

        {/* Status Chips Row */}
        {isLoading ? (
          <KbStatusChipsSkeleton />
        ) : (
          <StatusChips
            currentStatus={status}
            statusCounts={statusCounts}
            onSelectStatus={setStatus}
          />
        )}

        {/* Filters Row */}
        <ArticleFilters
          search={search}
          onSearchChange={setSearch}
          categories={categories}
          selectedCategory={categoryId}
          onCategoryChange={setCategory}
          authors={authors}
          selectedAuthor={authorId}
          onAuthorChange={setAuthor}
          sort={sort}
          order={order}
          onToggleSort={toggleSort}
          isOptionsLoading={isLoadingOptions}
        />

        {/* Error state */}
        {isError && (
          <div className="kb-error-box" role="alert">
            <Icon name="alert-circle" size={20} className="kb-error-icon" />
            <div className="kb-error-text">
              <strong>Failed to load articles:</strong> {error?.userMessage || error?.message || 'Server error'}
            </div>
            <button
              type="button"
              className="kb-retry-btn"
              onClick={() => refetch()}
            >
              Retry
            </button>
            <button
              type="button"
              className="kb-retry-btn"
              onClick={handleResetFilters}
              aria-label="Reset filters"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Table Card (hidden while the request has failed to avoid empty state under error) */}
        {!isError && (
          <div className="kb-table-card">
            <ArticlesTable
              articles={articles}
              isLoading={isLoading}
              sort={sort}
              order={order}
              onSort={toggleSort}
              onResetFilters={handleResetFilters}
            />
            {isLoading ? <KbPaginationSkeleton /> : (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={total}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
