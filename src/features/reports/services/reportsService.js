import apiClient from '../../../lib/axios';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

/**
 * Reports API Service
 * Handles communication with /api/v1/reports/analytics
 *
 * Response envelope from backend:
 *   { status: "success", data: { analytics: { period, kpis, ticket_volume, sla, agent_performance, csat } } }
 *
 * The shared axios interceptor returns the server body directly (unwraps transport),
 * so we receive { status, data: { analytics } } as the resolved value.
 */
export const reportsService = {
  /**
   * Fetch the full analytics payload.
   *
   * @param {Object} [params]
   * @param {string} [params.date_from]  "YYYY-MM-DD"
   * @param {string} [params.date_to]    "YYYY-MM-DD"
   * @param {string|null} [params.agent_id]
   * @returns {Promise<Object>} analytics payload
   */
  getAnalytics: async ({ date_from, date_to, agent_id } = {}) => {
    const query = {};
    if (date_from) query.date_from = date_from;
    if (date_to)   query.date_to   = date_to;
    if (agent_id)  query.agent_id  = String(agent_id);

    const response = await apiClient.get(API_ENDPOINTS.REPORTS.ANALYTICS, { params: query });
    // Unwrap: response is { status, data: { analytics } }
    return response?.data?.analytics ?? response?.analytics ?? null;
  },
};

export default reportsService;

