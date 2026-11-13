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
  USERS: {
    // GET /api/v1/users/agents — Admin-only directory of active AGENT users
    AGENTS: '/users/agents',
  },
  REPORTS: {
    ANALYTICS: '/reports/analytics',
  },
  KB: {
    OVERVIEW: '/kb/overview',
    ARTICLES: '/kb/articles',
    ARTICLE_BY_ID: (id) => `/kb/articles/${id}`,
    PUBLISH_ARTICLE: (id) => `/kb/articles/${id}/publish`,
    FEEDBACK: (id) => `/kb/articles/${id}/feedback`,
    RELATED: (id) => `/kb/articles/${id}/related`,
    CATEGORIES: '/kb/categories',
    CATEGORY_BY_ID: (id) => `/kb/categories/${id}`,
    REORDER_CATEGORIES: '/kb/categories/reorder',
    AUTHORS: '/kb/authors',
    AI_SUGGEST: '/kb/ai/suggest',
    EXPORT: '/kb/articles/export',
  },
  SETTINGS: {
    WORKSPACE: '/settings/workspace',
    WORKSPACE_CHECK_URL: '/settings/workspace/check-url',
    PROFILE: '/settings/profile',
    PROFILE_AVATAR: '/settings/profile/avatar',
    PROFILE_PASSWORD: '/settings/profile/password',
    PROFILE_2FA: '/settings/profile/2fa',
    SESSIONS: '/settings/sessions',
    SESSIONS_REVOKE_OTHERS: '/settings/sessions/revoke-others',
    TEAM: '/settings/team',
    NOTIFICATIONS: '/settings/notifications',
    AI: '/settings/ai',
    AI_PREVIEW: '/settings/ai/preview',
  },
};
