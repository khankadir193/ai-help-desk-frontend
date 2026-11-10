import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import kbService from '../services/kbService';
import { useDebouncedValue } from './useDebouncedValue';
import { KB_KEYS } from './useKbOverview';

export function useArticles() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract params from URL
  const search = searchParams.get('q') || '';
  const status = (searchParams.get('status') || 'ALL').toUpperCase();
  const categoryId = searchParams.get('category') || '';
  const authorId = searchParams.get('author') || '';
  const sort = searchParams.get('sort') || 'article_id';
  const order = searchParams.get('order') || 'asc';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '8', 10);

  // Debounce search query so typing does not trigger instant fetches
  const debouncedSearch = useDebouncedValue(search, 300);

  // Memoized query params object
  const queryParams = useMemo(() => ({
    q: debouncedSearch,
    status,
    categoryId: categoryId || undefined,
    authorId: authorId || undefined,
    sort,
    order,
    page,
    pageSize,
  }), [debouncedSearch, status, categoryId, authorId, sort, order, page, pageSize]);

  // Query articles with TanStack Query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: KB_KEYS.articles(queryParams),
    queryFn: ({ signal }) => kbService.listArticles({ ...queryParams, signal }),
    staleTime: 30 * 1000,
  });

  // URL State setters
  const updateParams = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || (key === 'status' && value === 'ALL')) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      return next;
    });
  }, [setSearchParams]);

  const setSearch = useCallback((val) => {
    updateParams({ q: val, page: 1 });
  }, [updateParams]);

  const setStatus = useCallback((val) => {
    updateParams({ status: val, page: 1 });
  }, [updateParams]);

  const setCategory = useCallback((val) => {
    updateParams({ category: val, page: 1 });
  }, [updateParams]);

  const setAuthor = useCallback((val) => {
    updateParams({ author: val, page: 1 });
  }, [updateParams]);

  const setPage = useCallback((newPage) => {
    updateParams({ page: newPage });
  }, [updateParams]);

  const toggleSort = useCallback((columnKey) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const currentSort = next.get('sort') || 'article_id';
      const currentOrder = next.get('order') || 'asc';

      if (currentSort === columnKey) {
        next.set('order', currentOrder === 'asc' ? 'desc' : 'asc');
      } else {
        next.set('sort', columnKey);
        next.set('order', 'asc');
      }
      return next;
    });
  }, [setSearchParams]);

  const handleExport = useCallback(() => {
    kbService.exportArticlesCsv({
      q: debouncedSearch,
      status,
      categoryId: categoryId || undefined,
      authorId: authorId || undefined,
    });
  }, [debouncedSearch, status, categoryId, authorId]);

  return {
    articles: data?.items || [],
    total: data?.total || 0,
    page: data?.page || page,
    pageSize: data?.pageSize || pageSize,
    totalPages: data?.totalPages || 1,
    statusCounts: data?.statusCounts || { all: 0, published: 0, draft: 0, in_review: 0, archived: 0 },
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    // Filters & Setters
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
  };
}

export default useArticles;

