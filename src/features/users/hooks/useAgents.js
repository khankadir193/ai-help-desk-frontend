import { useQuery } from '@tanstack/react-query';
import userService from '../services/userService';

export const USER_QUERY_KEYS = {
  all: ['users'],
  agents: () => [...USER_QUERY_KEYS.all, 'agents'],
};

/**
 * Hook to fetch the active-agent directory (ADMIN only).
 * The backend rejects non-admin callers with 403, so consumers should only
 * enable this query for Admin users (or guard their UI by role).
 *
 * Results are cached per session; the directory changes rarely, so the data
 * is kept fresh for a minute and never refetches in the background.
 *
 * @param {Object} [options]
 * @param {boolean} [options.enabled=true] - Query enable toggle
 * @returns {Query<{ agents: Array<{ id, name, email }> }>}
 */
export function useAgents({ enabled = true } = {}) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.agents(),
    queryFn: () => userService.listAgents(),
    enabled,
    staleTime: 1000 * 60, // 1 minute — agent accounts change infrequently
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount, error) => {
      // Never retry auth errors; retry once on network/server errors
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 404) return false;
      return failureCount < 1;
    },
  });
}
