import axios from 'axios';
import { getErrorMessage } from '../utils/errorHandler';

// Single source of truth for the API origin. Strip trailing slashes so a
// value like ".../api/v1/" cannot produce double slashes in request URLs.
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
).replace(/\/+$/, '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 60s timeout to tolerate Render free-tier cold starts
  timeout: 60000,
  // Required so HttpOnly session cookies (helpdesk.sid) are sent with requests
  withCredentials: true,
});

// Response Interceptor: Centralized Error Normalization & Session Expiry Notification
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Expose the HTTP status at the top level so callers can branch on it
    // (e.g. 403 = no access) without digging into error.response. Purely
    // additive — error.response and error.response.status are unchanged.
    error.status = error.response?.status;

    // Attach clean user-facing error message
    error.userMessage = getErrorMessage(error);

    // If an authenticated request encounters 401 (excluding auth endpoints like /me, /login, /register),
    // broadcast session expiry so the auth layer can sync without infinite loops.
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint =
        requestUrl.includes('/auth/me') ||
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register');

      if (!isAuthEndpoint) {
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      }
    }

    // If a request returns 403, notify the auth layer to refetch fresh permissions
    if (error.response?.status === 403) {
      window.dispatchEvent(new CustomEvent('auth:permission-denied'));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { apiClient };
