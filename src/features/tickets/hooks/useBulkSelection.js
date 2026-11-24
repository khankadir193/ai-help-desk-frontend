import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook to manage bulk ticket selection state.
 */
export function useBulkSelection(currentPageItemIds = []) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  const isAllSelected = useMemo(() => {
    if (currentPageItemIds.length === 0) return false;
    return currentPageItemIds.every((id) => selectedIds.has(String(id)));
  }, [currentPageItemIds, selectedIds]);

  const isIndeterminate = useMemo(() => {
    if (currentPageItemIds.length === 0) return false;
    const count = currentPageItemIds.filter((id) => selectedIds.has(String(id))).length;
    return count > 0 && count < currentPageItemIds.length;
  }, [currentPageItemIds, selectedIds]);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelectedOnPage = currentPageItemIds.every((id) => next.has(String(id)));
      if (allSelectedOnPage) {
        currentPageItemIds.forEach((id) => next.delete(String(id)));
      } else {
        currentPageItemIds.forEach((id) => next.add(String(id)));
      }
      return next;
    });
  }, [currentPageItemIds]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const strId = String(id);
      if (next.has(strId)) {
        next.delete(strId);
      } else {
        next.add(strId);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id) => selectedIds.has(String(id)),
    [selectedIds]
  );

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    isAllSelected,
    isIndeterminate,
    toggleSelectAll,
    toggleSelect,
    clearSelection,
    isSelected,
  };
}
