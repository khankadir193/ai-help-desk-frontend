import apiClient from '../../../lib/axios';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

/**
 * User API Service
 * Handles communication with /api/v1/users
 *
 * Backend contract:
 *  - GET /agents  (ADMIN only) → { status, data: { agents } }
 *    Directory of ACTIVE AGENT accounts used by the ticket-assignment
 *    workflow. Every agent entry carries exactly:
 *      { id, name, email }
 *    Deactivated agents, admins, customers, passwords and timestamps are
 *    never included. RBAC is enforced server-side (403 for agents/customers,
 *    401 without a session).
 */
export const userService = {
  /**
   * List active support agents (ADMIN only)
   * @returns {Promise<Array<{ id: string, name: string, email: string }>>}
   */
  listAgents: async () => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.AGENTS);
    return response?.data?.agents ?? response?.agents ?? [];
  },
};

export default userService;
