import apiClient from '../../../lib/axios';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const settingsService = {
  // Workspace
  getWorkspace: async () => {
    const res = await apiClient.get(API_ENDPOINTS.SETTINGS.WORKSPACE);
    return res?.data?.workspace ?? res?.workspace ?? res;
  },

  updateWorkspace: async (patchData) => {
    const res = await apiClient.patch(API_ENDPOINTS.SETTINGS.WORKSPACE, patchData);
    return res?.data?.workspace ?? res?.workspace ?? res;
  },

  checkWorkspaceUrl: async (url) => {
    const res = await apiClient.get(API_ENDPOINTS.SETTINGS.WORKSPACE_CHECK_URL, {
      params: { url },
    });
    return res?.data ?? res;
  },

  // Profile
  getProfile: async () => {
    const res = await apiClient.get(API_ENDPOINTS.SETTINGS.PROFILE);
    return res?.data?.profile ?? res?.profile ?? res;
  },

  updateProfile: async (patchData) => {
    const res = await apiClient.patch(API_ENDPOINTS.SETTINGS.PROFILE, patchData);
    return res?.data?.profile ?? res?.profile ?? res;
  },

  uploadAvatar: async (avatarData) => {
    const res = await apiClient.post(API_ENDPOINTS.SETTINGS.PROFILE_AVATAR, {
      avatar: avatarData,
    });
    return res?.data ?? res;
  },

  changePassword: async ({ currentPassword, newPassword, confirmPassword }) => {
    const res = await apiClient.post(API_ENDPOINTS.SETTINGS.PROFILE_PASSWORD, {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return res?.data ?? res;
  },

  get2fa: async () => {
    const res = await apiClient.get(API_ENDPOINTS.SETTINGS.PROFILE_2FA);
    return res?.data ?? res;
  },

  update2fa: async (data) => {
    const res = await apiClient.post(API_ENDPOINTS.SETTINGS.PROFILE_2FA, data);
    return res?.data ?? res;
  },

  // Sessions
  getSessions: async () => {
    const res = await apiClient.get(API_ENDPOINTS.SETTINGS.SESSIONS);
    return res?.data ?? res;
  },

  revokeOtherSessions: async () => {
    const res = await apiClient.post(API_ENDPOINTS.SETTINGS.SESSIONS_REVOKE_OTHERS);
    return res?.data ?? res;
  },

  // Team
  getTeam: async () => {
    const res = await apiClient.get(API_ENDPOINTS.SETTINGS.TEAM);
    return res?.data?.team ?? res?.team ?? res;
  },

  updateTeam: async (patchData) => {
    const res = await apiClient.patch(API_ENDPOINTS.SETTINGS.TEAM, patchData);
    return res?.data?.team ?? res?.team ?? res;
  },

  // Notifications
  getNotifications: async () => {
    const res = await apiClient.get(API_ENDPOINTS.SETTINGS.NOTIFICATIONS);
    return res?.data?.notifications ?? res?.notifications ?? res;
  },

  updateNotifications: async (patchData) => {
    const res = await apiClient.patch(API_ENDPOINTS.SETTINGS.NOTIFICATIONS, patchData);
    return res?.data?.notifications ?? res?.notifications ?? res;
  },

  // AI
  getAi: async () => {
    const res = await apiClient.get(API_ENDPOINTS.SETTINGS.AI);
    return res?.data?.ai ?? res?.ai ?? res;
  },

  updateAi: async (patchData) => {
    const res = await apiClient.patch(API_ENDPOINTS.SETTINGS.AI, patchData);
    return res?.data?.ai ?? res?.ai ?? res;
  },

  getAiPreview: async (tone) => {
    const res = await apiClient.get(API_ENDPOINTS.SETTINGS.AI_PREVIEW, {
      params: { tone },
    });
    return res?.data?.preview ?? res?.preview ?? res;
  },
};

export default settingsService;

