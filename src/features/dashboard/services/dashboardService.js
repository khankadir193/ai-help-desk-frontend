import apiClient from '../../../lib/axios';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

/**
 * Dashboard API Service
 * Handles communication with /api/v1/dashboard
 *
 * Backend contract (role decided server-side from the authenticated session):
 *  - GET /  -> 200 { status, data: { dashboard: {...} } }
 *
 * dashboard shape:
 *  - CUSTOMER / AGENT / ADMIN:
 *      { role, total_tickets, status_counts: {OPEN, IN_PROGRESS, RESOLVED, CLOSED},
 *        priority_counts: {LOW, MEDIUM, HIGH, URGENT},
 *        recent_tickets: [...], pagination: { page, limit, total_items, total_pages } }
 *  - ADMIN additionally:
 *      category_counts: [{ category_id: string|null, category_name, count }]
 *      agent_workload:  [{ agent_id, agent_name, total_assigned, open, in_progress, resolved, closed }]
 *
 * Query params: page (>=1, default 1), limit (1–100, default 20) — applied
 * to recent_tickets only.
 */
export const dashboardService = {
  /**
   * Fetch the role-scoped dashboard payload
   * @param {Object} [params]
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   * @returns {Promise<Object>} dashboard payload
   */
  getDashboard: async ({ page, limit } = {}) => {
    const query = {};
    if (page) query.page = String(page);
    if (limit) query.limit = String(limit);

    const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.BASE, { params: query });
    // The shared axios client unwraps the transport response to the server
    // body ({ status, data: { dashboard } }); take dashboard from either the
    // body or the raw transport response. A malformed envelope resolves to
    // null so the page renders its error state instead of zero-filled data.
    return response?.data?.dashboard ?? response?.dashboard ?? null;
  },
};

export default dashboardService;
