import axios from 'axios';
import { getErrorMessage } from '../utils/errorHandler';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  // Required so HttpOnly session cookies (helpdesk.sid) are sent with requests
  withCredentials: true,
});

// Response Interceptor: Centralized Error Normalization & Session Expiry Notification
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Attach clean user-facing error message
    error.userMessage = getErrorMessage(error);

    // If an authenticated request encounters 401 (excluding the initial /auth/me check),
    // broadcast session expiry so the auth layer can sync without infinite loops.
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isInitialSessionCheck = requestUrl.includes('/auth/me');

      if (!isInitialSessionCheck) {
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { apiClient };
