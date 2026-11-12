import Icon from '../../../../components/Icon/Icon';
import './ArticleFilters.css';

export default function ArticleFilters({
  search = '',
  onSearchChange,
  categories = [],
  selectedCategory = '',
  onCategoryChange,
  authors = [],
  selectedAuthor = '',
  onAuthorChange,
  sort = 'article_id',
  order = 'asc',
  onToggleSort,
  isOptionsLoading = false,
}) {
  const sortLabel = sort === 'article_id'
    ? `Article ID: ${order === 'asc' ? 'ascending' : 'descending'}`
    : sort === 'title'
    ? `Title: ${order === 'asc' ? 'A-Z' : 'Z-A'}`
    : sort === 'updated_at' || sort === 'updated'
    ? `Updated: ${order === 'asc' ? 'oldest' : 'newest'}`
    : `${sort}: ${order}`;

  // Match selectedCategory whether it was passed as a slug or numeric id
  const matchedCategory = categories.find(
    (c) => String(c.slug) === String(selectedCategory) || String(c.id) === String(selectedCategory)
  );
  const resolvedCategoryValue =
    selectedCategory === 'uncategorized'
      ? 'uncategorized'
      : matchedCategory
      ? String(matchedCategory.slug || matchedCategory.id)
      : selectedCategory;

  return (
    <div className="kb-article-filters">
      {/* Search Input */}
      <div className="kb-article-filters__search">
        <Icon name="search" size={16} className="kb-article-filters__search-icon" />
        <input
          type="text"
          className="kb-article-filters__search-input"
          placeholder="Search title, article ID or tag..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search articles"
        />
        {search && (
          <button
            type="button"
            className="kb-article-filters__clear-btn"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            <Icon name="x" size={14} />
          </button>
        )}
      </div>

      {/* Categories Dropdown */}
      {isOptionsLoading ? (
        <span className="kb-skel" style={{ width: 168, height: 40, borderRadius: 8 }} aria-hidden="true" />
      ) : (
        <div className="kb-article-filters__select-wrapper">
          <select
            className="kb-article-filters__select"
            value={resolvedCategoryValue}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug || c.id}>
                {c.name}
              </option>
            ))}
            {selectedCategory === 'uncategorized' && (
              <option value="uncategorized">Uncategorized</option>
            )}
          </select>
          <Icon name="chevron-down" size={14} className="kb-article-filters__chevron" />
        </div>
      )}

      {/* Authors Dropdown */}
      {isOptionsLoading ? (
        <span className="kb-skel" style={{ width: 148, height: 40, borderRadius: 8 }} aria-hidden="true" />
      ) : (
        <div className="kb-article-filters__select-wrapper">
          <select
            className="kb-article-filters__select"
            value={selectedAuthor}
            onChange={(e) => onAuthorChange(e.target.value)}
            aria-label="Filter by author"
          >
            <option value="">All authors</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <Icon name="chevron-down" size={14} className="kb-article-filters__chevron" />
        </div>
      )}

      {/* Sort Toggle Button on the Right */}
      <button
        type="button"
        className="kb-article-filters__sort-btn"
        onClick={() => onToggleSort('article_id')}
        aria-label="Toggle sort order"
      >
        <span>{sortLabel}</span>
        <span className="kb-article-filters__sort-arrow">{order === 'asc' ? '↑' : '↓'}</span>
      </button>
    </div>
  );
}
