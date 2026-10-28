import axios from 'axios';
import { storage } from '../utils/storage';
import { getErrorMessage } from '../utils/errorHandler';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized Error Normalization & Auth handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Attach clean user-facing error message
    error.userMessage = getErrorMessage(error);

    // Handle token expiration or invalid session
    if (error.response?.status === 401) {
      storage.clearAuth();
      // Broadcast event so AuthProvider can react without a hard window reload
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { apiClient };

