import { useRef, useEffect } from 'react';
import TicketRow from './TicketRow';
import BulkActionBar from './BulkActionBar';
import TicketsSkeleton from './TicketsSkeleton';
import TicketsEmptyState from './TicketsEmptyState';
import TicketsErrorState from './TicketsErrorState';
import Icon from '../../../components/Icon/Icon';
import './TicketsTable.css';

export default function TicketsTable({
  tickets = [],
  isLoading = false,
  isFetching = false,
  isError = false,
  onRetry,
  pagination = {},
  currentPage = 1,
  onPageChange,
  isAllSelected = false,
  isIndeterminate = false,
  onToggleSelectAll,
  isSelected,
  onToggleSelect,
  selectedCount = 0,
  onClearSelection,
  onAssignTo,
  onChangeStatus,
  onOpenDeleteDialog,
  canDelete = false,
  agents = [],
  isFiltered = false,
  onClearFilters,
  onCreateTicket,
  canCreate = true,
  isStaff = true,
  sort = 'updated_at',
  order = 'desc',
  onSortChange,
}) {
  const selectAllCheckboxRef = useRef(null);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const totalItems = Number(pagination.total_items) || 0;
  const limit = Number(pagination.limit) || 10;
  const totalPages =
    Number(pagination.total_pages) ||
    (totalItems > 0 ? Math.ceil(totalItems / limit) : 0);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  // Generate pagination page buttons (< 1 2 3 ... 25 >)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const handleToggleUpdatedSort = () => {
    const nextOrder = sort === 'updated_at' && order === 'desc' ? 'asc' : 'desc';
    onSortChange('updated_at', nextOrder);
  };

  return (
    <div className="tickets-table-card">
      {/* Fetching progress line */}
      {isFetching && !isLoading && <div className="tickets-table__progress-bar" />}

      {/* Bulk Action Bar (shows on top when items are selected) */}
      {selectedCount > 0 && (
        <BulkActionBar
          selectedCount={selectedCount}
          onClearSelection={onClearSelection}
          onAssignTo={onAssignTo}
          onChangeStatus={onChangeStatus}
          onOpenDeleteDialog={onOpenDeleteDialog}
          canDelete={canDelete}
          agents={agents}
        />
      )}

      {/* Main Table */}
      <div className="tickets-table-container">
        <table className="tickets-table">
          <thead>
            <tr className="tickets-table__head-row">
              {isStaff && (
                <th scope="col" className="tickets-table__th tickets-table__th--checkbox">
                  <input
                    ref={selectAllCheckboxRef}
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    aria-label="Select all tickets on this page"
                    className="tickets-table__checkbox"
                  />
                </th>
              )}
              <th scope="col" className="tickets-table__th tickets-table__th--id">
                ID
              </th>
              <th scope="col" className="tickets-table__th tickets-table__th--subject">
                Subject
              </th>
              <th scope="col" className="tickets-table__th tickets-table__th--customer">
                Customer
              </th>
              <th scope="col" className="tickets-table__th tickets-table__th--priority">
                Priority
              </th>
              <th scope="col" className="tickets-table__th tickets-table__th--status">
                Status
              </th>
              <th scope="col" className="tickets-table__th tickets-table__th--agent">
                Assigned agent
              </th>
              <th scope="col" className="tickets-table__th tickets-table__th--category">
                Category
              </th>
              <th scope="col" className="tickets-table__th tickets-table__th--date">
                Created
              </th>
              <th
                scope="col"
                className="tickets-table__th tickets-table__th--updated tickets-table__th--sortable"
                onClick={handleToggleUpdatedSort}
                aria-sort={sort === 'updated_at' ? (order === 'desc' ? 'descending' : 'ascending') : 'none'}
              >
                <span>Updated</span>
                <span className="tickets-table__sort-arrow" aria-hidden="true">
                  {sort === 'updated_at' && order === 'asc' ? '↑' : '↓'}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={isStaff ? 10 : 9} className="tickets-table__state-cell">
                  <TicketsSkeleton rowCount={9} />
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={isStaff ? 10 : 9} className="tickets-table__state-cell">
                  <TicketsErrorState onRetry={onRetry} />
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={isStaff ? 10 : 9} className="tickets-table__state-cell">
                  <TicketsEmptyState
                    isFiltered={isFiltered}
                    onClearFilters={onClearFilters}
                    onCreateTicket={onCreateTicket}
                    canCreate={canCreate}
                  />
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  isSelected={isSelected(ticket.id)}
                  onToggleSelect={onToggleSelect}
                  isStaff={isStaff}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Card Footer with Showing N of Total & Pagination */}
      {!isLoading && !isError && totalItems > 0 && (
        <div className="tickets-table__footer">
          <div className="tickets-table__footer-left">
            Showing {startItem}-{endItem} of {totalItems}
          </div>

          {totalPages > 1 && (
            <nav className="tickets-table__pagination" aria-label="Ticket pagination">
              <button
                type="button"
                className="tickets-table__page-btn tickets-table__page-btn--arrow"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous page"
              >
                <Icon name="chevron-left" size={14} />
              </button>

              {getPageNumbers().map((p, idx) => {
                if (p === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="tickets-table__page-ellipsis" aria-hidden="true">
                      ...
                    </span>
                  );
                }
                const isActive = p === currentPage;
                return (
                  <button
                    key={p}
                    type="button"
                    className={`tickets-table__page-btn ${isActive ? 'tickets-table__page-btn--active' : ''}`}
                    onClick={() => onPageChange(p)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                className="tickets-table__page-btn tickets-table__page-btn--arrow"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
              >
                <Icon name="chevron-right" size={14} />
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
