import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TicketsHeader from '../components/TicketsHeader';
import TicketTabs from '../components/TicketTabs';
import TicketFilters from '../components/TicketFilters';
import FilterChips from '../components/FilterChips';
import TicketsTable from '../components/TicketsTable';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import CreateTicketModal from '../components/CreateTicketModal';
import Icon from '../../../components/Icon/Icon';
import {
  useTickets,
  useAgentsWithCounts,
  useBulkUpdateStatus,
  useBulkUpdateAssignment,
  useBulkDeleteTickets,
} from '../hooks/useTickets';
import { useBulkSelection } from '../hooks/useBulkSelection';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCategories } from '../../categories/hooks/useCategories';
import ticketService from '../services/ticketService';
import { downloadCsvFile } from '../utils/csvHelpers';
import { getErrorMessage } from '../../../utils/errorHandler';
import './TicketsListPage.css';

export default function TicketsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useAuth();

  const isCustomer = role === 'CUSTOMER';
  const isAdmin = role === 'ADMIN';
  const isStaff = role === 'ADMIN' || role === 'AGENT' || role === 'MANAGER';

  // Read state from URL search params
  const tab = searchParams.get('tab') || 'all';
  const q = searchParams.get('q') || '';
  const statusParam = searchParams.get('status');
  const status = useMemo(() => (statusParam ? statusParam.split(',').filter(Boolean) : []), [statusParam]);

  const priorityParam = searchParams.get('priority');
  const priority = useMemo(() => (priorityParam ? priorityParam.split(',').filter(Boolean) : []), [priorityParam]);

  const agent = searchParams.get('agent') || '';
  const categoryParam = searchParams.get('category');
  const category = useMemo(() => (categoryParam ? categoryParam.split(',').filter(Boolean) : []), [categoryParam]);

  const dateRange = searchParams.get('date') || 'last_7_days';
  const sort = searchParams.get('sort') || 'updated_at';
  const order = searchParams.get('order') || 'desc';
  const page = Number(searchParams.get('page')) || 1;

  // Helper to update search params while preserving unchanged keys
  const updateQuery = (newParams) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          updated.delete(key);
        } else if (Array.isArray(value)) {
          updated.set(key, value.join(','));
        } else {
          updated.set(key, String(value));
        }
      });
      return updated;
    });
  };

  // Local debounced search input state synced with q
  const [prevQ, setPrevQ] = useState(q);
  const [searchInput, setSearchInput] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setSearchInput(q);
  }

  // Debounce search update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== q) {
        updateQuery({ q: searchInput || undefined, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, q]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toast feedback state
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev.message === message ? { message: '', type: 'success' } : prev));
    }, 4500);
  };

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Query filters sent to backend
  const filters = useMemo(() => {
    return {
      tab,
      q: q || undefined,
      status: status.length > 0 ? status.join(',') : undefined,
      priority: priority.length > 0 ? priority.join(',') : undefined,
      agent_id: agent || undefined,
      category_id: category.length > 0 ? category.join(',') : undefined,
      date_range: dateRange !== 'all' ? dateRange : undefined,
      sort,
      order,
      page,
      limit: 10,
    };
  }, [tab, q, status, priority, agent, category, dateRange, sort, order, page]);

  // Data fetching
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useTickets(filters);

  const tickets = useMemo(() => data?.tickets ?? [], [data?.tickets]);
  const pagination = data?.pagination ?? {};
  const counts = data?.counts ?? { all: 0, mine: 0, unassigned: 0 };

  // Categories & Agents directory
  const { data: categories = [] } = useCategories({ isActive: isAdmin ? undefined : true });
  const { data: agents = [] } = useAgentsWithCounts({ enabled: isStaff });

  // Bulk selection hook
  const currentPageIds = useMemo(() => tickets.map((t) => t.id), [tickets]);
  const {
    selectedIds,
    selectedCount,
    isAllSelected,
    isIndeterminate,
    toggleSelectAll,
    toggleSelect,
    clearSelection,
    isSelected,
  } = useBulkSelection(currentPageIds);

  // Clear selection if current page becomes empty or changes
  useEffect(() => {
    if (page > 1 && !isLoading && tickets.length === 0 && pagination.total_items > 0) {
      setSearchParams((prev) => {
        const updated = new URLSearchParams(prev);
        updated.set('page', String(page - 1));
        return updated;
      });
    }
  }, [page, isLoading, tickets.length, pagination.total_items, setSearchParams]);

  // Mutations
  const bulkStatusMutation = useBulkUpdateStatus();
  const bulkAssignMutation = useBulkUpdateAssignment();
  const bulkDeleteMutation = useBulkDeleteTickets();

  // Handlers for bulk actions
  const handleBulkAssign = async (targetAgentId) => {
    if (selectedCount === 0) return;
    try {
      const res = await bulkAssignMutation.mutateAsync({
        ticketIds: selectedIds,
        assignedAgentId: targetAgentId,
      });
      const updated = res?.data?.updated_count ?? selectedCount;
      showToast(`${updated} ${updated === 1 ? 'ticket' : 'tickets'} assigned successfully.`);
      clearSelection();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleBulkStatus = async (nextStatus) => {
    if (selectedCount === 0) return;
    try {
      const res = await bulkStatusMutation.mutateAsync({
        ticketIds: selectedIds,
        status: nextStatus,
      });
      const updated = res?.data?.updated_count ?? selectedCount;
      showToast(`${updated} ${updated === 1 ? 'ticket' : 'tickets'} updated to ${nextStatus}.`);
      clearSelection();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedCount === 0) return;
    try {
      const res = await bulkDeleteMutation.mutateAsync(selectedIds);
      const deleted = res?.data?.deleted_count ?? selectedCount;
      showToast(`${deleted} ${deleted === 1 ? 'ticket' : 'tickets'} deleted permanently.`);
      clearSelection();
      setIsDeleteModalOpen(false);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  // CSV Export
  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const csvContent = await ticketService.exportCsv(filters);
      downloadCsvFile(csvContent, `tickets-${tab}-${new Date().toISOString().slice(0, 10)}.csv`);
      showToast('Export downloaded successfully.');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    updateQuery({
      q: undefined,
      status: undefined,
      priority: undefined,
      agent: undefined,
      category: undefined,
      date: 'last_7_days',
      page: 1,
    });
  };

  return (
    <main className="tickets-page" aria-label="Tickets">
      {/* Toast Notification */}
      {toast.message && (
        <div className={`tickets-page__toast tickets-page__toast--${toast.type}`} role="status">
          <Icon name={toast.type === 'error' ? 'alert-circle' : 'check-circle'} size={18} />
          <span>{toast.message}</span>
          <button
            type="button"
            className="tickets-page__toast-close"
            onClick={() => setToast({ message: '', type: 'success' })}
            aria-label="Dismiss toast"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <TicketsHeader
        activeTab={tab}
        canExport={true}
        onExportCsv={handleExportCsv}
        isExporting={isExporting}
      />

      {/* Navigation Tabs */}
      <TicketTabs
        activeTab={tab}
        counts={counts}
        onTabChange={(newTab) => {
          clearSelection();
          updateQuery({ tab: newTab, page: 1 });
        }}
        isCustomer={isCustomer}
      />

      {/* Filters Row */}
      <TicketFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        status={status}
        onStatusChange={(newStatus) => updateQuery({ status: newStatus, page: 1 })}
        priority={priority}
        onPriorityChange={(newPriority) => updateQuery({ priority: newPriority, page: 1 })}
        agent={agent}
        onAgentChange={(newAgent) => updateQuery({ agent: newAgent, page: 1 })}
        category={category}
        onCategoryChange={(newCategory) => updateQuery({ category: newCategory, page: 1 })}
        dateRange={dateRange}
        onDateRangeChange={(newDate) => updateQuery({ date: newDate, page: 1 })}
        sort={sort}
        order={order}
        onSortChange={(newSort, newOrder) => updateQuery({ sort: newSort, order: newOrder, page: 1 })}
        categories={categories}
        agents={agents}
        activeTab={tab}
        isCustomer={isCustomer}
      />

      {/* Filter Chips Row */}
      <FilterChips
        search={q}
        totalResults={pagination.total_items ?? 0}
        status={status}
        priority={priority}
        agent={agent}
        category={category}
        dateRange={dateRange}
        onRemoveStatus={() => updateQuery({ status: undefined, page: 1 })}
        onRemovePriority={() => updateQuery({ priority: undefined, page: 1 })}
        onRemoveAgent={() => updateQuery({ agent: undefined, page: 1 })}
        onRemoveCategory={() => updateQuery({ category: undefined, page: 1 })}
        onRemoveDate={() => updateQuery({ date: 'last_7_days', page: 1 })}
        onClearAll={handleClearAllFilters}
        categories={categories}
        agents={agents}
      />

      {/* Table Card */}
      <TicketsTable
        tickets={tickets}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        onRetry={refetch}
        pagination={pagination}
        currentPage={page}
        onPageChange={(p) => updateQuery({ page: p })}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onToggleSelectAll={toggleSelectAll}
        isSelected={isSelected}
        onToggleSelect={toggleSelect}
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onAssignTo={handleBulkAssign}
        onChangeStatus={handleBulkStatus}
        onOpenDeleteDialog={() => setIsDeleteModalOpen(true)}
        canDelete={isAdmin}
        agents={agents}
        isFiltered={Boolean(q || status.length || priority.length || agent || category.length || dateRange !== 'last_7_days')}
        onClearFilters={handleClearAllFilters}
        onCreateTicket={() => setIsCreateModalOpen(true)}
        canCreate={true}
        isStaff={isStaff}
        sort={sort}
        order={order}
        onSortChange={(s, o) => updateQuery({ sort: s, order: o, page: 1 })}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteModalOpen}
        ticketIds={selectedIds}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={bulkDeleteMutation.isPending}
      />

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <CreateTicketModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(msg) => {
            showToast(msg);
            refetch();
          }}
        />
      )}
    </main>
  );
}
