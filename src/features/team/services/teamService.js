/**
 * Team Service — API requests for team performance, roles matrix,
 * invitations, and member directory.
 */
import apiClient from '../../../lib/axios';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const teamService = {
  /**
   * Fetch team performance metrics for date range.
   * Supports AbortSignal for request cancellation.
   */
  getPerformance: async (params = {}, signal) => {
    const response = await apiClient.get(API_ENDPOINTS.TEAM.PERFORMANCE, {
      params,
      signal,
    });
    return response?.data ?? response ?? {};
  },

  /**
   * Export performance metrics as CSV blob.
   */
  exportPerformanceCsv: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.TEAM.PERFORMANCE_EXPORT, {
      params,
      responseType: 'blob',
    });
    return response;
  },

  /**
   * Fetch roles and permissions matrix.
   */
  getRoles: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TEAM.ROLES);
    return response?.data ?? response ?? {};
  },

  /**
   * Update permissions matrix (Admin only).
   */
  patchRoles: async (permissions) => {
    const response = await apiClient.patch(API_ENDPOINTS.TEAM.ROLES, { permissions });
    return response?.data ?? response ?? {};
  },

  /**
   * Request role/permission access change.
   */
  requestRoleChange: async (payload) => {
    const response = await apiClient.post(API_ENDPOINTS.TEAM.ROLES_REQUEST_CHANGE, payload);
    return response?.data ?? response ?? {};
  },

  /**
   * Fetch teams list.
   */
  getTeams: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TEAM.TEAMS);
    return response?.data?.teams ?? response?.teams ?? [];
  },

  /**
   * Fetch invite options (assignable roles and expiry config).
   */
  getInviteOptions: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TEAM.INVITE_OPTIONS);
    return response?.data ?? response ?? {};
  },

  /**
   * Send a new member invitation.
   */
  createInvitation: async (payload) => {
    const response = await apiClient.post(API_ENDPOINTS.TEAM.INVITATIONS, payload);
    return response?.data?.invitation ?? response?.invitation ?? response?.data ?? {};
  },

  /**
   * Fetch member directory and pending invitations.
   */
  listMembers: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TEAM.MEMBERS);
    return response?.data ?? response ?? {};
  },

  /**
   * Resend a pending invitation.
   */
  resendInvitation: async (id) => {
    const response = await apiClient.post(API_ENDPOINTS.TEAM.RESEND_INVITATION(id));
    return response?.data?.invitation ?? response?.invitation ?? response?.data ?? {};
  },

  /**
   * Revoke a pending invitation.
   */
  revokeInvitation: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.TEAM.REVOKE_INVITATION(id));
    return response?.data ?? response ?? {};
  },
};

export default teamService;
