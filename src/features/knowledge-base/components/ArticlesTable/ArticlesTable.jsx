import { Link } from 'react-router-dom';
import StatusBadge from '../StatusBadge/StatusBadge';
import { formatDate } from '../../utils/kbUtils';
import './ArticlesTable.css';

export default function ArticlesTable({
  articles = [],
  isLoading = false,
  sort = 'article_id',
  order = 'asc',
  onSort,
  onResetFilters,
}) {
  const renderSortIndicator = (col) => {
    if (sort !== col) return null;
    return <span className="kb-table__sort-icon" aria-hidden="true">{order === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="kb-table-container">
      <div className="kb-table-scroll">
        <table className="kb-table" aria-label="Knowledge Base articles list">
          <thead>
            <tr>
              <th scope="col" className="kb-table__th kb-table__th--article" onClick={() => onSort?.('title')}>
                <div className="kb-table__th-content">
                  <span>Article</span>
                  {renderSortIndicator('title')}
                </div>
              </th>
              <th scope="col" className="kb-table__th kb-table__th--category" onClick={() => onSort?.('category')}>
                <div className="kb-table__th-content">
                  <span>Category</span>
                  {renderSortIndicator('category')}
                </div>
              </th>
              <th scope="col" className="kb-table__th kb-table__th--status" onClick={() => onSort?.('status')}>
                <div className="kb-table__th-content">
                  <span>Status</span>
                  {renderSortIndicator('status')}
                </div>
              </th>
              <th scope="col" className="kb-table__th kb-table__th--author" onClick={() => onSort?.('author')}>
                <div className="kb-table__th-content">
                  <span>Author</span>
                  {renderSortIndicator('author')}
                </div>
              </th>
              <th scope="col" className="kb-table__th kb-table__th--updated" onClick={() => onSort?.('updated_at')}>
                <div className="kb-table__th-content">
                  <span>Updated</span>
                  {renderSortIndicator('updated_at')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // 8 skeleton rows
              Array.from({ length: 8 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="kb-table__row kb-table__row--skeleton">
                  <td className="kb-table__td">
                    <div className="kb-skeleton kb-skeleton--title" />
                    <div className="kb-skeleton kb-skeleton--subtitle" />
                  </td>
                  <td className="kb-table__td">
                    <div className="kb-skeleton kb-skeleton--text" />
                  </td>
                  <td className="kb-table__td">
                    <div className="kb-skeleton kb-skeleton--pill" />
                  </td>
                  <td className="kb-table__td">
                    <div className="kb-skeleton kb-skeleton--text" />
                  </td>
                  <td className="kb-table__td">
                    <div className="kb-skeleton kb-skeleton--date" />
                  </td>
                </tr>
              ))
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={5} className="kb-table__td--empty">
                  <div className="kb-table__empty-state">
                    <p className="kb-table__empty-title">No articles match your criteria</p>
                    <p className="kb-table__empty-text">Try adjusting your filters or search terms.</p>
                    {onResetFilters && (
                      <button type="button" className="kb-table__empty-btn" onClick={onResetFilters}>
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              articles.map((article) => {
                const tagsString = (article.tags || []).join(', ');
                const formattedDate = formatDate(article.updated_at);

                return (
                  <tr key={article.id || article.article_id} className="kb-table__row">
                    <td className="kb-table__td kb-table__td--article">
                      <Link
                        to={`/knowledge-base/articles/${article.article_id || article.id}`}
                        className="kb-table__article-title"
                      >
                        {article.title}
                      </Link>
                      <div className="kb-table__article-meta">
                        <span className="kb-table__article-id">{article.article_id}</span>
                        {tagsString && (
                          <>
                            <span className="kb-table__meta-sep">·</span>
                            <span className="kb-table__article-tags">{tagsString}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="kb-table__td kb-table__td--category">
                      <span className="kb-table__category-text">{article.category || '–'}</span>
                    </td>
                    <td className="kb-table__td kb-table__td--status">
                      <StatusBadge status={article.status} />
                    </td>
                    <td className="kb-table__td kb-table__td--author">
                      <span className="kb-table__author-text">{article.author || '–'}</span>
                    </td>
                    <td className="kb-table__td kb-table__td--updated">
                      <span className="kb-table__updated-date">{formattedDate}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

