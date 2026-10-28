import apiClient from '../../../lib/axios';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const authService = {
  /**
   * Authenticate user with email and password
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} user profile object
   */
  login: async ({ email, password }) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: email.trim().toLowerCase(),
      password,
    });
    return response.data?.user;
  },

  /**
   * Register a new user account with default CUSTOMER role
   * Note: Public registration cannot select roles. Backend assigns CUSTOMER automatically.
   * @param {Object} data - { name, email, password }
   * @returns {Promise<Object>} created user safe profile
   */
  register: async ({ name, email, password }) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
    return response.data?.user;
  },

  /**
   * Fetch currently authenticated user's session profile
   * @returns {Promise<Object>} user profile object
   */
  getMe: async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return response.data?.user;
  },

  /**
   * Invalidate server-side session and remove cookie
   * @returns {Promise<Object>} response status
   */
  logout: async () => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response;
  },
};

export default authService;
