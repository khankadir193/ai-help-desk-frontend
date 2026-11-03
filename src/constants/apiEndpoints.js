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
    COMMENTS: (id) => `/tickets/${id}/comments`,
    HISTORY: (id) => `/tickets/${id}/history`,
  },
  AI: {
    // Mounted under /tickets on the backend: POST /api/v1/tickets/:id/ai/classify
    CLASSIFY: (id) => `/tickets/${id}/ai/classify`,
    // Mounted under /tickets on the backend: POST /api/v1/tickets/:id/ai/priority
    PRIORITY: (id) => `/tickets/${id}/ai/priority`,
    // Mounted under /tickets on the backend: POST /api/v1/tickets/:id/ai/reply-draft
    REPLY_DRAFT: (id) => `/tickets/${id}/ai/reply-draft`,
    // Mounted under /tickets on the backend: POST /api/v1/tickets/:id/ai/summary
    SUMMARY: (id) => `/tickets/${id}/ai/summary`,
  },
  DASHBOARD: {
    BASE: '/dashboard',
  },
};
