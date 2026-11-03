import apiClient from '../../../lib/axios';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

/**
 * Category API Service
 * Handles communication with /api/v1/categories
 */
export const categoryService = {
  /**
   * List categories
   * For Customers and Agents: only active categories are returned.
   * For Admins: all categories by default, with optional is_active boolean filter.
   *
   * @param {Object} [options]
   * @param {boolean} [options.isActive] - Optional filter for active status (admin only)
   * @returns {Promise<Array<Object>>} Array of category objects
   */
  listCategories: async ({ isActive } = {}) => {
    const params = {};
    if (typeof isActive === 'boolean') {
      params.is_active = String(isActive);
    }

    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.BASE, { params });
    return response?.data?.categories ?? response?.categories ?? [];
  },

  /**
   * Get category details by ID
   * Active categories are viewable by all authenticated roles.
   * Inactive categories return 404 for customers/agents, but 200 for admins.
   *
   * @param {string|number} id
   * @returns {Promise<Object>} Category object
   */
  getCategoryById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.BY_ID(id));
    return response?.data?.category ?? response?.category ?? response;
  },

  /**
   * Create a new category (Admin only)
   *
   * @param {Object} data
   * @param {string} data.name - Required, 1-80 chars
   * @param {string} [data.description] - Optional, max 500 chars
   * @param {boolean} [data.is_active=true] - Optional, defaults to true
   * @returns {Promise<Object>} Created category
   */
  createCategory: async ({ name, description, is_active = true }) => {
    const payload = {
      name: (name || '').trim(),
      ...(description !== undefined && description !== null
        ? { description: description.trim() || null }
        : {}),
      ...(is_active !== undefined ? { is_active: Boolean(is_active) } : {}),
    };

    const response = await apiClient.post(API_ENDPOINTS.CATEGORIES.BASE, payload);
    return response?.data?.category ?? response?.category ?? response;
  },

  /**
   * Update category name, description, or status (Admin only)
   *
   * @param {string|number} id
   * @param {Object} data
   * @param {string} [data.name]
   * @param {string|null} [data.description]
   * @param {boolean} [data.is_active]
   * @returns {Promise<Object>} Updated category
   */
  updateCategory: async (id, data) => {
    const payload = {};
    if (data.name !== undefined) {
      payload.name = (data.name || '').trim();
    }
    if (data.description !== undefined) {
      payload.description =
        typeof data.description === 'string'
          ? data.description.trim() || null
          : null;
    }
    if (data.is_active !== undefined) {
      payload.is_active = Boolean(data.is_active);
    }

    const response = await apiClient.patch(API_ENDPOINTS.CATEGORIES.BY_ID(id), payload);
    return response?.data?.category ?? response?.category ?? response;
  },

  /**
   * Update category active status (Admin only)
   *
   * @param {string|number} id
   * @param {boolean} isActive
   * @returns {Promise<Object>} Updated category
   */
  updateCategoryStatus: async (id, isActive) => {
    const response = await apiClient.patch(API_ENDPOINTS.CATEGORIES.STATUS(id), {
      is_active: Boolean(isActive),
    });
    return response?.data?.category ?? response?.category ?? response;
  },
};

export default categoryService;

