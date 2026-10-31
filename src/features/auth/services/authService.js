import apiClient from '../../../lib/axios';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const authService = {
  /**
   * Authenticate user with email and password
   * @param {Object|string} credentials - { email, password } or email string
   * @param {string} [maybePassword] - password if first arg is email
   * @returns {Promise<Object>} user profile object { id, name, email, role }
   */
  login: async (credentials, maybePassword) => {
    const email = typeof credentials === 'object' && credentials !== null ? credentials.email : credentials;
    const password = typeof credentials === 'object' && credentials !== null ? credentials.password : maybePassword;

    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: (email || '').trim().toLowerCase(),
      password,
    });
    return response?.data?.user || response?.user || response;
  },

  /**
   * Register a new user account with default CUSTOMER role
   * Note: Public registration cannot select roles. Backend assigns CUSTOMER automatically.
   * @param {Object|string} data - { name, email, password } or name string
   * @param {string} [maybeEmail] - email if first arg is name
   * @param {string} [maybePassword] - password if first arg is name
   * @returns {Promise<Object>} created user safe profile { id, name, email, role, created_at }
   */
  register: async (data, maybeEmail, maybePassword) => {
    let name;
    let email;
    let password;

    if (typeof data === 'object' && data !== null) {
      name = data.name;
      email = data.email;
      password = data.password;
    } else {
      name = data;
      email = maybeEmail;
      password = maybePassword;
    }

    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
      name: (name || '').trim(),
      email: (email || '').trim().toLowerCase(),
      password,
    });
    return response?.data?.user || response?.user || response;
  },

  /**
   * Fetch currently authenticated user's session profile
   * @returns {Promise<Object>} user profile object
   */
  getMe: async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return response?.data?.user || response?.user || response;
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
