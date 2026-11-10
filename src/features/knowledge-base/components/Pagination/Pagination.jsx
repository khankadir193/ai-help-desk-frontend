import './Pagination.css';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 8,
  onPageChange,
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="kb-pagination" aria-label="Pagination">
      <div className="kb-pagination__info">
        Showing {startItem}-{endItem} of {totalItems} articles · {pageSize} per page
      </div>

      <nav className="kb-pagination__controls" aria-label="Page navigation">
        <button
          type="button"
          className="kb-pagination__btn kb-pagination__btn--nav"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          Previous
        </button>

        {getPageNumbers().map((pageItem, idx) => {
          if (pageItem === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="kb-pagination__ellipsis" aria-hidden="true">
                ...
              </span>
            );
          }

          const isCurrent = pageItem === currentPage;
          return (
            <button
              key={pageItem}
              type="button"
              className={`kb-pagination__btn kb-pagination__btn--page ${
                isCurrent ? 'kb-pagination__btn--active' : ''
              }`}
              onClick={() => onPageChange(pageItem)}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {pageItem}
            </button>
          );
        })}

        <button
          type="button"
          className="kb-pagination__btn kb-pagination__btn--nav"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          Next
        </button>
      </nav>
    </div>
  );
}

