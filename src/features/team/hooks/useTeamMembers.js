/**
 * Hook for managing workspace members and pending invitations.
 *
 * Page, page size, and the search term live in the URL query params
 * (?q=&page=&pageSize=) so refresh and back/forward keep the view, mirroring
 * the Knowledge Base articles list. Previous rows stay visible (dimmed by
 * the page) while a new page loads thanks to keepPreviousData.
 */
import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import teamService from '../services/teamService';
import useDebouncedValue from './useDebouncedValue';

export function useTeamMembers() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state (same clamping rules as the KB list)
  const search = searchParams.get('q') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = Math.max(
    1,
    Math.min(100, parseInt(searchParams.get('pageSize') || '10', 10) || 10),
  );

  // Debounce the search so typing does not trigger instant fetches
  const debouncedSearch = useDebouncedValue(search, 300);

  const queryParams = useMemo(
    () => ({
      q: debouncedSearch.trim() || undefined,
      page,
      pageSize,
    }),
    [debouncedSearch, page, pageSize],
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['team', 'members', queryParams],
    queryFn: ({ signal }) => teamService.listMembers(queryParams, signal),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
  });

  const members = data?.members || [];
  const invitations = data?.invitations || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const meta =
    data?.meta || { total_members: total, pending_invitations: invitations.length };

  // URL state setters
  const updateParams = useCallback(
    (updates) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
        });
        return next;
      });
    },
    [setSearchParams],
  );

  // Any search/filter change resets to page 1
  const setSearch = useCallback(
    (val) => updateParams({ q: val, page: 1 }),
    [updateParams],
  );

  const setPage = useCallback(
    (newPage) => updateParams({ page: newPage }),
    [updateParams],
  );

  // If the server clamped an out-of-range page (e.g. the last page shrank
  // after a revoke), keep the URL page in sync with the returned page.
  useEffect(() => {
    if (!isLoading && !isFetching && data?.page && data.page !== page) {
      updateParams({ page: data.page });
    }
  }, [data, page, isLoading, isFetching, updateParams]);

  // If the current page becomes empty after a revoke/removal, step back one
  // page instead of showing an empty page.
  useEffect(() => {
    if (!isLoading && !isFetching && members.length === 0 && page > 1 && total > 0) {
      updateParams({ page: page - 1 });
    }
  }, [members.length, page, total, isLoading, isFetching, updateParams]);

  // Resend invitation mutation — refetch in both outcomes so rows reflect
  // reality (a failed resend may still have extended the expiry, and a 404
  // means the row is stale and must disappear).
  const resendMutation = useMutation({
    mutationFn: (id) => teamService.resendInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
    },
  });

  // Revoke invitation mutation — refetch in both outcomes: on success the
  // row disappears; on 404 (already revoked / stale list) the list refreshes
  // instead of leaving a broken row on screen.
  const revokeMutation = useMutation({
    mutationFn: (id) => teamService.revokeInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
    },
  });

  return {
    members,
    invitations,
    meta,
    total,
    page: data?.page || page,
    pageSize: data?.pageSize || pageSize,
    totalPages,
    // Search
    search,
    setSearch,
    // Pagination
    setPage,
    // Query state
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    // Mutations
    resendInvite: resendMutation.mutateAsync,
    isResending: resendMutation.isPending,
    revokeInvite: revokeMutation.mutateAsync,
    isRevoking: revokeMutation.isPending,
  };
}

export default useTeamMembers;
