import apiClient from '../../../lib/axios';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

/**
 * Notifications API Service
 * Handles fetching notifications, unread counts, and mark-as-read actions.
 */
export const notificationService = {
  /**
   * Fetch current user's notifications and unread count
   * @param {Object} [params]
   * @param {number} [params.limit=30]
   * @returns {Promise<{ notifications: Array, unread_count: number }>}
   */
  getNotifications: async ({ limit = 30 } = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.BASE, {
      params: { limit },
    });
    return response?.data ?? response ?? { notifications: [], unread_count: 0 };
  },

  /**
   * Mark a single notification as read
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  markAsRead: async (id) => {
    const response = await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    return response?.data?.notification ?? response?.notification ?? null;
  },

  /**
   * Mark all notifications as read for current user
   * @returns {Promise<{ count: number }>}
   */
  markAllAsRead: async () => {
    const response = await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    return response?.data ?? response ?? { count: 0 };
  },
};

export default notificationService;
