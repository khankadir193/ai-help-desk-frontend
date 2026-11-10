import apiClient from '../../../lib/axios';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

/**
 * Knowledge Base API service communicating with /api/v1/kb
 */
export const kbService = {
  getOverview: async () => {
    const res = await apiClient.get(API_ENDPOINTS.KB.OVERVIEW);
    return res?.data ?? res;
  },

  listArticles: async (params = {}) => {
    const res = await apiClient.get(API_ENDPOINTS.KB.ARTICLES, { params });
    return res?.data ?? res;
  },

  getArticle: async (id) => {
    const res = await apiClient.get(API_ENDPOINTS.KB.ARTICLE_BY_ID(id));
    return res?.data ?? res;
  },

  createArticle: async (data) => {
    const res = await apiClient.post(API_ENDPOINTS.KB.ARTICLES, data);
    return res?.data ?? res;
  },

  updateArticle: async (id, data) => {
    const res = await apiClient.patch(API_ENDPOINTS.KB.ARTICLE_BY_ID(id), data);
    return res?.data ?? res;
  },

  publishArticle: async (id) => {
    const res = await apiClient.post(API_ENDPOINTS.KB.PUBLISH_ARTICLE(id));
    return res?.data ?? res;
  },

  deleteArticle: async (id) => {
    const res = await apiClient.delete(API_ENDPOINTS.KB.ARTICLE_BY_ID(id));
    return res?.data ?? res;
  },

  voteFeedback: async (id, helpful) => {
    const res = await apiClient.post(API_ENDPOINTS.KB.FEEDBACK(id), { helpful });
    return res?.data ?? res;
  },

  getRelatedArticles: async (id) => {
    const res = await apiClient.get(API_ENDPOINTS.KB.RELATED(id));
    return res?.data ?? res;
  },

  listCategories: async () => {
    const res = await apiClient.get(API_ENDPOINTS.KB.CATEGORIES);
    return res?.data ?? res;
  },

  createCategory: async (data) => {
    const res = await apiClient.post(API_ENDPOINTS.KB.CATEGORIES, data);
    return res?.data ?? res;
  },

  updateCategory: async (id, data) => {
    const res = await apiClient.patch(API_ENDPOINTS.KB.CATEGORY_BY_ID(id), data);
    return res?.data ?? res;
  },

  reorderCategories: async (orderedIds) => {
    const res = await apiClient.patch(API_ENDPOINTS.KB.REORDER_CATEGORIES, { orderedIds });
    return res?.data ?? res;
  },

  deleteCategory: async (id) => {
    const res = await apiClient.delete(API_ENDPOINTS.KB.CATEGORY_BY_ID(id));
    return res?.data ?? res;
  },

  listAuthors: async () => {
    const res = await apiClient.get(API_ENDPOINTS.KB.AUTHORS);
    return res?.data ?? res;
  },

  generateAiSuggestion: async (payload) => {
    const res = await apiClient.post(API_ENDPOINTS.KB.AI_SUGGEST, payload);
    return res?.data ?? res;
  },

  exportArticlesCsv: async (params = {}) => {
    // Download as a blob and trigger browser download
    const res = await apiClient.get(API_ENDPOINTS.KB.EXPORT, {
      params,
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kb-articles-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default kbService;

