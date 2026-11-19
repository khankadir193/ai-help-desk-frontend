import { useQuery } from '@tanstack/react-query';
import dashboardService from '../services/dashboardService';

export const DASHBOARD_QUERY_KEYS = {
  all: ['dashboard'],
  stats: (filters = {}) => [...DASHBOARD_QUERY_KEYS.all, 'stats', filters],
};

/**
 * Hook to fetch the role-scoped dashboard data.
 * Scope (own / assigned / all tickets) and the role are decided by the
 * backend from the authenticated session; role-specific sections (category
 * breakdown, agent workload) are present only for ADMIN responses.
 *
 * @param {Object} [filters] - { page, limit, startDate, endDate }
 *   startDate / endDate are YYYY-MM-DD strings (UTC) and are optional.
 *   When omitted the backend defaults to the last 7 UTC calendar days for
 *   the volume chart and all-time aggregates for KPIs.
 * @param {Object} [options]
 * @param {boolean} [options.enabled=true]
 */
export function useDashboard(filters = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.stats(filters),
    queryFn: () => dashboardService.getDashboard(filters),
    enabled,
    placeholderData: (previous) => previous,
  });
}
