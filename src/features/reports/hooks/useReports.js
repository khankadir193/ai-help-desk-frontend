import { useQuery } from '@tanstack/react-query';
import reportsService from '../services/reportsService';

export const REPORTS_QUERY_KEYS = {
  all:      ['reports'],
  analytics: (filters = {}) => [...REPORTS_QUERY_KEYS.all, 'analytics', filters],
};

/**
 * Hook to fetch the full analytics payload from /api/v1/reports/analytics.
 *
 * TanStack Query handles request cancellation automatically — when filters
 * change before a previous fetch resolves, the stale request is aborted and
 * the new one starts immediately (no race conditions).
 *
 * @param {Object} filters
 * @param {string} filters.date_from  "YYYY-MM-DD"
 * @param {string} filters.date_to    "YYYY-MM-DD"
 * @param {string|null} filters.agent_id
 * @param {Object} [options]
 * @param {boolean} [options.enabled=true]
 */
export function useReports(filters = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey:        REPORTS_QUERY_KEYS.analytics(filters),
    queryFn:         () => reportsService.getAnalytics(filters),
    enabled,
    placeholderData: (previous) => previous,
    staleTime:       2 * 60 * 1000, // 2 min — analytics don't change second-by-second
    retry:           (failureCount, error) => {
      // Never retry auth errors; retry once on network/server errors
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 404) return false;
      return failureCount < 1;
    },
  });
}

