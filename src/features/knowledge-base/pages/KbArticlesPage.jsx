import { useNavigate } from 'react-router-dom';
import KbHeader from '../components/KbHeader/KbHeader';
import KbTabs from '../components/KbTabs/KbTabs';
import StatusChips from '../components/StatusChips/StatusChips';
import ArticleFilters from '../components/ArticleFilters/ArticleFilters';
import ArticlesTable from '../components/ArticlesTable/ArticlesTable';
import Pagination from '../components/Pagination/Pagination';
import { useArticles } from '../hooks/useArticles';
import { useKbCategories } from '../hooks/useCategories';
import './KbArticlesPage.css';

export default function KbArticlesPage() {
  const navigate = useNavigate();
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

  const { categories = [], authors = [] } = useKbCategories();

  const handleResetFilters = () => {
    setSearch('');
    setStatus('ALL');
    setCategory('');
    setAuthor('');
    setPage(1);
  };

  return (
    <main className="kb-page kb-articles-page" aria-label="Knowledge Base Articles">
      {/* Header */}
      <KbHeader
        title="All articles"
        subtitle="Manage, review and maintain your knowledge base."
        actions={
          <>
            <button
              type="button"
              className="kb-secondary-btn"
              onClick={handleExport}
              aria-label="Export articles as CSV"
            >
              Export
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
      <StatusChips
        currentStatus={status}
        statusCounts={statusCounts}
        onSelectStatus={setStatus}
      />

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
      />

      {/* Error state */}
      {isError && (
        <div className="kb-error-box" role="alert">
          <div className="kb-error-text">
            <strong>Failed to load articles:</strong> {error?.message || 'Server error'}
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="kb-table-card">
        <ArticlesTable
          articles={articles}
          isLoading={isLoading}
          sort={sort}
          order={order}
          onSort={toggleSort}
          onResetFilters={handleResetFilters}
        />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </main>
  );
}

