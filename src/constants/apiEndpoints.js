export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id) => `/categories/${id}`,
    STATUS: (id) => `/categories/${id}/status`,
  },
  TICKETS: {
    BASE: '/tickets',
    BY_ID: (id) => `/tickets/${id}`,
    STATUS: (id) => `/tickets/${id}/status`,
    ASSIGNMENT: (id) => `/tickets/${id}/assignment`,
  },
};
